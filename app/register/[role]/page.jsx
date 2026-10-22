import React from "react";
import { SignupForm } from "../_components/signup-form";

// Registration is student-only (admins are promoted manually by an existing
// admin from /account/users) — the [role] segment is only kept so existing
// /register/student links keep working.
const RegisterPage = () => {
  return (
    <div className="w-full flex-col h-screen flex items-center justify-center">
      <div className="container">
        <SignupForm />
      </div>
    </div>
  );
};

export default RegisterPage;
