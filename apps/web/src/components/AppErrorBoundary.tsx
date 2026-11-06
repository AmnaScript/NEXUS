
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
};

export default class AppErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Replace console reporting with a privacy-conscious
        // monitoring service if one is added later.
        console.error("NEXUS application error:", error, info.componentStack);
    }

    handleRetry = () => {
        window.location.reload();
    };

    handleHome = () => {
        window.location.assign("/");
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <main className="flex min-h-[100dvh] items-center justify-center bg-[#FFF6E5] px-5 py-12 text-[#1B1F3B]">
                <div className="w-full max-w-[560px]">
                    <div className="flex items-center justify-between border-b-2 border-[#1B1F3B] pb-5">
                        <span className="nx-display text-3xl font-extrabold">
                            nexus<span className="text-[#FF5A4E]">.</span>
                        </span>

                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                            System notice
                        </span>
                    </div>

                    <div className="mt-10 inline-flex h-16 w-16 items-center justify-center rounded-[18px] border-2 border-[#1B1F3B] bg-[#FFC93C]">
                        <AlertTriangle size={31} strokeWidth={1.8} />
                    </div>

                    <h1 className="nx-display mt-7 text-[clamp(2.8rem,7vw,4.8rem)] font-extrabold leading-[1.02] tracking-tight">
                        Something went
                        <br />
                        off-route<span className="text-[#FF5A4E]">.</span>
                    </h1>

                    <p className="mt-6 max-w-md text-base leading-8 text-[#656477]">
                        This part of NEXUS encountered an unexpected error.
                        Your browser can retry loading the page, or you can
                        return to the homepage.
                    </p>

                    <div className="mt-9 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={this.handleRetry}
                            className="nx-button nx-button-ink"
                        >
                            <RotateCcw size={17} />
                            Reload page
                        </button>

                        <button
                            type="button"
                            onClick={this.handleHome}
                            className="nx-button nx-button-paper"
                        >
                            <ArrowLeft size={17} />
                            Back home
                        </button>
                    </div>

                    <p className="mt-10 border-t border-[#D8D0C1] pt-5 text-xs leading-6 text-[#777587]">
                        If the problem continues, it may be related to the
                        network, browser graphics support, or an application error.
                    </p>
                </div>
            </main>
        );
    }
}
