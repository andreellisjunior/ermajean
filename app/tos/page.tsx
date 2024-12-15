import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: December 13, 2024

Welcome to ermajean! These Terms & Services ("Terms") govern your access to and use of our website and services (collectively, the "Services"). By using the Services, you agree to be bound by these Terms. If you do not agree, do not use our Services.

1. Acceptance of Terms By accessing or using ermajean, you agree to comply with and be bound by these Terms. If you are using the Services on behalf of an organization, you represent that you are authorized to bind that organization to these Terms.

2. Description of Services ermajean is a recipe management tool that allows users to save their own recipes and generate new ones. By subscribing to the Services, users agree to have their data stored on ermajean servers and those of associated partners.

3. User Accounts

Account Information: To use the Services, you must provide accurate and complete information, including your name, email address, and payment information.

Data Storage: All data associated with your account, including recipes and personal information, will be stored by ermajean and its partners. By using the Services, you consent to this storage.

4. User Data

Collected Data: ermajean collects your name, email address, and payment information to provide and manage the Services.

Privacy Policy: For details on how we handle your personal information, please review our Privacy Policy at https://ermajean.com/privacy-policy.

5. Updates to the Termsermajean reserves the right to update these Terms at any time. Users will be notified of any changes via the email associated with their account. Continued use of the Services after updates constitutes acceptance of the revised Terms.

6. Governing LawThese Terms are governed by the laws of the United States of America. Any disputes arising from these Terms will be resolved in accordance with these laws.

7. Contact InformationFor any questions or concerns about these Terms, please contact us at:Email: support@ermajean.com

By using ermajean, you acknowledge that you have read, understood, and agree to these Terms & Services.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
