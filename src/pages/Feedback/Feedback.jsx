import { useState } from "react";
import { FaClipboard, FaDiscord, FaExternalLinkAlt } from "react-icons/fa";

const Feedback = () => {
    const discordInviteUrl = "https://discord.gg/x53VXYDVT4";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(discordInviteUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch (error) {
            console.error("Failed to copy Discord invite:", error);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Feedback</h2>
                    <p className="mt-2 text-sm text-base-content/70">
                        Share suggestions, report issues, or join the CG Savior community on Discord.
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-[#5865F2]/10 p-3 text-[#5865F2]">
                            <FaDiscord className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Join our Discord server</h3>
                            <p className="mt-2 max-w-2xl text-sm text-base-content/70">
                                Use this invite link to send feedback, ask questions, and discuss improvements with the community.
                            </p>
                            <p className="mt-3 break-all rounded-lg border border-base-300 bg-base-200 px-3 py-2 font-mono text-sm">
                                {discordInviteUrl}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                        <a
                            href={discordInviteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary gap-2"
                        >
                            <FaExternalLinkAlt />
                            Open Discord
                        </a>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="btn btn-outline gap-2"
                        >
                            <FaClipboard />
                            {copied ? "Copied" : "Copy Link"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
