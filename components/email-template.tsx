import * as React from "react";

interface EmailTemplateProps {
  userId: string;
  userEmail: string;
  content: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  userId,
  userEmail,
  content,
}) => (
  <div>
    <h2>User Email: {userEmail}</h2>
    <p>User Id: {userId}</p>
    <p>{content}</p>
  </div>
);
