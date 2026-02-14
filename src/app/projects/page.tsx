import { redirect } from "next/navigation";
import { auth } from "../lib/auth"
import ProjectClient from "./ProjectsClient";
import { headers } from "next/headers";

const page = async () => {

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})

  if(!session){
    redirect("/signup");
  }

  return <ProjectClient user={session.user}/>
}

export default page