"use client"

import StreamView from "../components/StreamView"


const creatorId = "9cc8fa2c-ee9f-41cc-a741-30670782564e"



export default function Dashboard() {
    return <StreamView creatorId={creatorId} playVideo={true}/>;
}
