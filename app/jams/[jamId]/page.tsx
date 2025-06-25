"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import JamPage from "../../components/JamPage";
import { Redirect } from "@/app/components/Redirect";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const params = useParams();
  const jamId = params.jamId as string;
  const router = useRouter();

  <Redirect/>

  return <JamPage jamId={jamId} playVideo={true} />;
}
