import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React from "react";

export default function page() {
  return (
    <div className="container mx-auto">
      <div className="">
        <Button>کلیک کن</Button>
      </div>
      <div>
        <Input />
      </div>
      <div>
        <Label />
      </div>
      <div>
        <Badge variant="secondary">sad</Badge>
      </div>
    </div>
  );
}
