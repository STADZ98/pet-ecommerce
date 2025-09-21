import React from "react";
import TrackLookup from "../components/TrackLookup";

export default function TrackPage() {
  return (
    <div className="container mx-auto p-6">
      <TrackLookup apiBase={"/api"} />
    </div>
  );
}
