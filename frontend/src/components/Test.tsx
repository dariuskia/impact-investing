"use client";

import { api } from "~/trpc/react";

function Test() {
  const updateUser = api.user.addItem.useMutation();
  return (
    <button
      onClick={() => {
        updateUser.mutate({});
      }}
    >
      log info
    </button>
  );
}

export default Test;
