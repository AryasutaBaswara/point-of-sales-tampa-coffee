import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import Image from "next/image";
import { DarkmodeToggle } from "../components/common/darkmode-toggle";

export default function Home() {
  return (
    <div>
      <Input placeholder="Input" />
      <Button className="dark:bg-yellow-300 bg-red-300">Button</Button>
      <DarkmodeToggle />
    </div>
  );
}
