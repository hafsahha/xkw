import { redirect } from "next/navigation";
import React from "react";

export default function ImagePage({ params } : { params: Promise<{ id: string; idx: string }> }) {
    const { id, idx } = React.use(params);
    redirect(`/tweet/${id}`);
}