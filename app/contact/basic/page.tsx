import { basicForm } from "@/lib/server/basic-form";
import { Eyebrow } from "@/components/common";
export const metadata = {
  title: "Single-page enquiry",
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";
export default function BasicEnquiry() {
  return (
    <section className="section paper">
      <div className="wrap">
        <div className="basic-enquiry">
          <Eyebrow>YOUR PAYMENT BRIEF</Eyebrow>
          <h1>Let’s map your next move.</h1>
          <p className="lead">
            A single-page form that also works with JavaScript disabled. Check
            all your details before sending.
          </p>
          <div dangerouslySetInnerHTML={{ __html: basicForm() }} />
        </div>
      </div>
    </section>
  );
}
