import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AuthScreen from "./AuthScreen";
import MainApp from "./MainApp";
import { LoadingScreen } from "./components/ui";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = ainda não sabemos
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data || { id: session.user.id, email: session.user.email, role: "member" });
        setProfileLoading(false);
      });
  }, [session]);

  if (session === undefined) return <LoadingScreen />;
  if (!session) return <AuthScreen />;
  if (profileLoading || !profile) return <LoadingScreen label="preparando seu perfil..." />;

  return <MainApp session={session} profile={profile} />;
}
