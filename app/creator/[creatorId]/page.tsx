import JamPage from "@/app/components/JamPage";

export default async function CreatorPage({
    params
}: {
    params: Promise<{ creatorId: string }>
}) {
    const { creatorId } = await params;
    return <JamPage creatorId={creatorId} playVideo={false}/>
}