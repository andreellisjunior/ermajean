export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div
          role="status"
          className="rounded-lg bg-[#DEE6D8] text-[#244638] p-3"
        >
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div
          role="alert"
          className="rounded-lg border border-[#B84732] bg-[#fff4ef] text-[#963b29] p-3"
        >
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div
          role="status"
          className="rounded-lg bg-[#EADBA7] text-[#244638] p-3"
        >
          {message.message}
        </div>
      )}
    </div>
  );
}
