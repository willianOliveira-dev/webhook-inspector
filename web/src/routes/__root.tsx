import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from '../components/layout/sidebar';

const queryClient = new QueryClient();

const RootLayout = () => (
    <QueryClientProvider client={queryClient}>
        <Toaster />
        <div className="h-screen bg-white-50 text-white-900">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={20} minSize={15} maxSize={40}>
                    <Sidebar />
                </Panel>
                <PanelResizeHandle className="w-px bg-white-300 hover:bg-white-400 transition-colors duration-150" />
                <Panel defaultSize={80} minSize={60}>
                    <Outlet />
                </Panel>
            </PanelGroup>
        </div>
    </QueryClientProvider>
);

export const Route = createRootRoute({ component: RootLayout });
