import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { execFileSync, execFile } from "node:child_process";
import { promisify } from "node:util";
const container = process.env.ERMAJEAN_TEST_POSTGRES_CONTAINER;
let database = "postgres";
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
function sql(statement: string) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      container!,
      "psql",
      "-X",
      "-q",
      "-t",
      "-A",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      database,
    ],
    { input: statement, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  ).trim();
}
function asUser(id: string, statement: string) {
  return sql(
    `set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);select set_config('request.jwt.claim.role','authenticated',false);${statement}`,
  )
    .split("\n")
    .slice(2)
    .join("\n");
}
function denied(id: string, statement: string) {
  assert.throws(() => asUser(id, statement));
}
test(
  "real PostgreSQL owner isolation, protected billing, atomic plans, publication and nutrition",
  { skip: !container },
  async (t) => {
    const testDatabase = `ermajean_security_${Date.now()}`;
    sql(`create database ${testDatabase};`);
    database = testDatabase;
    t.after(() => {
      database = "postgres";
      sql(`drop database ${testDatabase} with (force);`);
    });
    sql(
      `do $$begin if not exists(select from pg_roles where rolname='anon')then create role anon;end if;if not exists(select from pg_roles where rolname='authenticated')then create role authenticated;end if;if not exists(select from pg_roles where rolname='service_role')then create role service_role bypassrls;end if;end$$;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.role() returns text language sql stable as $$select nullif(current_setting('request.jwt.claim.role',true),'')$$;grant usage on schema auth to anon,authenticated,service_role;create function public.uuid_generate_v4() returns uuid language sql as $$select gen_random_uuid()$$;`,
    );
    const reference = readFileSync("libs/supabase/db-schema.sql", "utf8");
    const statements = reference.match(/CREATE TABLE public\.[\s\S]*?\);/g)!;
    for (const name of [
      "profiles",
      "recipes",
      "meal_plans",
      "notes",
      "recipe_usage",
      "share_recipes",
    ])
      sql(
        statements.find((s) => s.startsWith(`CREATE TABLE public.${name} (`))!,
      );
    sql(
      readFileSync("supabase/migrations/2026092401_data_security.sql", "utf8"),
    );
    sql(
      readFileSync(
        "supabase/migrations/2026092404_nutrition_estimates.sql",
        "utf8",
      ),
    );
    sql(
      `insert into auth.users values('${a}'),('${b}');insert into public.profiles(id,name)values('${a}','A'),('${b}','B');insert into recipes(user_id,recipe_name,ingredients,instructions,servings,calories,protein,carbs,fat,fiber,sugar,sodium)values('${a}','A dinner','1 cup rice','cook','4',400,30,40,10,3,1,500),('${b}','B dinner','2 eggs','cook','2',200,15,2,5,0,0,300);`,
    );
    assert.equal(asUser(a, "select count(*) from recipes;"), "1");
    assert.equal(asUser(b, "select count(*) from recipes;"), "1");
    assert.equal(asUser(a, "select count(*) from recipes where id=2;"), "0");
    denied(a, "update profiles set has_access=true;");
    denied(a, "update profiles set customer_id='fake';");
    denied(a, "insert into recipe_usage(user_id)values(auth.uid());");
    denied(
      a,
      `insert into recipes(user_id,recipe_name)values('${b}','stolen');`,
    );
    denied(a, "insert into notes(recipe_id,title,note)values(2,'x','y');");
    denied(
      a,
      "insert into meal_plans(user_id,recipe_id,date,meal_type)values(auth.uid(),2,'2026-09-21','Dinner');",
    );
    assert.equal(
      asUser(
        a,
        "update profiles set name='Updated' where id=auth.uid() returning name;",
      ),
      "Updated",
    );
    denied(a, "select public.publish_recipe(2);");
    denied(a, "select public.delete_owned_recipe(2);");
    asUser(a, "select public.publish_recipe(1);");
    assert.equal(sql("set role anon;select count(*) from share_recipes;"), "1");
    denied(
      a,
      "insert into share_recipes(recipe_id,recipe_name)values(2,'fake');",
    );
    asUser(a, "select public.revoke_recipe(1);");
    assert.equal(sql("set role anon;select count(*) from share_recipes;"), "0");
    const token = asUser(a, "select public.begin_nutrition_estimate(1);");
    denied(a, "select public.begin_nutrition_estimate(1);");
    asUser(a, "update recipes set ingredients='2 cups rice' where id=1;");
    assert.equal(
      asUser(a, "select calories is null from recipes where id=1;"),
      "t",
    );
    assert.equal(
      asUser(
        a,
        `select public.finish_nutrition_estimate('${token}','{"calories":1,"protein":1,"carbs":1,"fat":1,"fiber":1,"sugar":1,"sodium":1}'::jsonb);`,
      ),
      "f",
    );
    const fresh = asUser(a, "select public.begin_nutrition_estimate(1);");
    assert.equal(
      asUser(b, `select public.finish_nutrition_estimate('${fresh}',null);`),
      "f",
    );
    assert.equal(
      asUser(
        a,
        `select public.finish_nutrition_estimate('${fresh}','{"calories":400,"protein":30,"carbs":40,"fat":10,"fiber":3,"sugar":1,"sodium":500}'::jsonb);`,
      ),
      "t",
    );
    assert.equal(asUser(a, "select calories from recipes where id=1;"), "400");
    const run = promisify(execFile);
    await Promise.all(
      Array.from({ length: 8 }, () =>
        run("docker", [
          "exec",
          container!,
          "psql",
          "-X",
          "-q",
          "-t",
          "-A",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          "postgres",
          "-d",
          database,
          "-c",
          `set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);select public.replace_meal_plan('2026-09-21','Dinner',1);`,
        ]),
      ),
    );
    assert.equal(
      asUser(
        a,
        "select count(*) from meal_plans where date='2026-09-21' and meal_type='Dinner';",
      ),
      "1",
    );
    const move = asUser(
      a,
      "select id from meal_plans where date='2026-09-21';",
    );
    asUser(a, "select public.replace_meal_plan('2026-09-22','Dinner',1);");
    denied(
      a,
      `select public.replace_meal_plan('2026-09-22','Dinner',1,'${move}');`,
    );
    assert.equal(
      asUser(a, `select date from meal_plans where id='${move}';`),
      "2026-09-21",
    );
    asUser(
      a,
      "insert into notes(recipe_id,title,note)values(1,'a','b');select public.publish_recipe(1);",
    );
    sql(`insert into recipe_usage(user_id,recipe_id)values('${a}',1);`);
    asUser(a, "select public.delete_owned_recipe(1);");
    assert.equal(asUser(a, "select count(*) from notes;"), "0");
    assert.equal(asUser(a, "select count(*) from meal_plans;"), "0");
    assert.equal(sql("set role anon;select count(*) from share_recipes;"), "0");
    assert.equal(asUser(a, "select count(*) from recipe_usage;"), "1");
    assert.equal(asUser(b, "select count(*) from recipes;"), "1");
    asUser(
      a,
      "insert into shopping_items(week_start,item_key,label)values('2026-09-21','rice','1 cup rice');",
    );
    assert.equal(asUser(b, "select count(*) from shopping_items;"), "0");
    sql(readFileSync("supabase/migrations/2026092403_generation.sql", "utf8"));
    const c = "33333333-3333-4333-8333-333333333333";
    sql(
      `insert into auth.users values('${c}');insert into profiles(id)values('${c}');`,
    );
    const keys = Array.from({ length: 8 }, () => randomUUID());
    const reservations = await Promise.all(
      keys.map((key) =>
        run("docker", [
          "exec",
          container!,
          "psql",
          "-X",
          "-q",
          "-t",
          "-A",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          "postgres",
          "-d",
          database,
          "-c",
          `set role service_role;select public.reserve_generation('${c}','${key}','same-hash');`,
        ]),
      ),
    );
    const statuses = reservations.map(
      (r) => JSON.parse(r.stdout.trim()).status,
    );
    assert.equal(statuses.filter((x) => x === "reserved").length, 3);
    assert.equal(statuses.filter((x) => x === "limit").length, 5);
    const reserved = keys.filter((_, i) => statuses[i] === "reserved");
    denied(
      c,
      `select public.reserve_generation('${c}','${randomUUID()}','h');`,
    );
    const output = JSON.stringify({
      ...{
        recipe_name: "Generated",
        description: "d",
        prep_time: "1 min",
        cook_time: "2 min",
        total_time: "3 min",
        servings: "2",
        difficulty_level: "Easy",
        course: "Dinner",
        ingredients: "2 eggs",
        instructions: "Cook eggs",
        is_kid_friendly: false,
      },
    });
    sql(
      `set role service_role;select public.complete_generation('${c}','${reserved[0]}','${output}'::jsonb);`,
    );
    assert.equal(
      JSON.parse(
        sql(
          `set role service_role;select public.reserve_generation('${c}','${reserved[0]}','same-hash');`,
        ),
      ).status,
      "succeeded",
    );
    assert.equal(
      JSON.parse(
        sql(
          `set role service_role;select public.reserve_generation('${c}','${reserved[0]}','different-hash');`,
        ),
      ).status,
      "conflict",
    );
    denied(a, `select public.save_generated_recipe('${reserved[0]}');`);
    const saved = asUser(
      c,
      `select (public.save_generated_recipe('${reserved[0]}')).id;`,
    );
    assert.equal(
      asUser(c, `select (public.save_generated_recipe('${reserved[0]}')).id;`),
      saved,
    );
    sql(
      `set role service_role;select public.fail_generation('${c}','${reserved[1]}');`,
    );
    assert.equal(
      JSON.parse(
        sql(
          `set role service_role;select public.reserve_generation('${c}','${reserved[1]}','same-hash');`,
        ),
      ).status,
      "failed",
    );
    assert.equal(
      JSON.parse(
        sql(
          `set role service_role;select public.reserve_generation('${c}','${randomUUID()}','retry-hash');`,
        ),
      ).status,
      "reserved",
    );

    // Billing leases fence stale workers and commit profile plus event atomically.
    sql(
      readFileSync(
        "supabase/migrations/2026092402_billing_webhooks.sql",
        "utf8",
      ),
    );
    const token1 = randomUUID(),
      token2 = randomUUID();
    denied(a, `select begin_billing_event('evt-1','cus-test','${token1}');`);
    assert.equal(
      sql(
        `set role service_role;select begin_billing_event('evt-1','cus-test','${token1}');`,
      ),
      "acquired",
    );
    assert.equal(
      sql(
        `set role service_role;select begin_billing_event('evt-2','cus-test','${token2}');`,
      ),
      "busy",
    );
    assert.throws(() =>
      sql(
        `set role service_role;select finish_billing_event('evt-1','cus-test','${token2}','${b}','price_1S1vPoEl9PRnOeq5lBf7pBbo',true);`,
      ),
    );
    sql(
      `set role service_role;select finish_billing_event('evt-1','cus-test','${token1}','${b}','price_1S1vPoEl9PRnOeq5lBf7pBbo',true);`,
    );
    assert.equal(asUser(b, "select has_access from profiles;"), "t");
    assert.equal(
      sql(
        `set role service_role;select begin_billing_event('evt-1','cus-test','${token2}');`,
      ),
      "processed",
    );
    assert.equal(
      JSON.parse(asUser(c, "select generation_allowance();")).remaining,
      0,
    );
    sql(
      `update generation_requests set created_at=now()-interval '3 minutes' where user_id='${c}' and status='pending';`,
    );
    assert.equal(
      JSON.parse(
        sql(
          `set role service_role;select reserve_generation('${c}','${randomUUID()}','after-timeout');`,
        ),
      ).status,
      "reserved",
    );
    sql(
      readFileSync(
        "supabase/migrations/2026092405_account_deletion.sql",
        "utf8",
      ),
    );
    sql(
      readFileSync(
        "supabase/migrations/2026092406_numeric_validation.sql",
        "utf8",
      ),
    );
    denied(b, "update recipes set protein='NaN';");
    denied(b, "update profiles set calorie_goal=-1;");
    denied(b, "select delete_user();");
    asUser(c, "select delete_user();");
    assert.equal(sql(`select count(*) from auth.users where id='${c}';`), "0");
    assert.equal(sql(`select count(*) from auth.users where id='${b}';`), "1");
  },
);
