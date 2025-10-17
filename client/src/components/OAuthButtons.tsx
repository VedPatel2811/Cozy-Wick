import React, { useEffect } from "react";

declare global {
  interface Window { google: any; }
}

export const GoogleButton: React.FC<{onCredential: (token: string)=>void}> = ({onCredential}) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => onCredential(response.credential) // id_token
      });
      window.google?.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "medium" }
      );
    };
    document.body.appendChild(script);
  }, []);
  return <div id="googleButton"></div>;
};
