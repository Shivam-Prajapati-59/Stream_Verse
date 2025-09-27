"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StorageBalance from "@/components/custom/StorageBalance";
import FileUploadForm from "@/components/custom/FileUploadForm";
import { DataViewer } from "@/components/custom/DataViewer";
import {
  Upload,
  Database,
  BarChart3,
  Settings,
  FileVideo,
  Cloud,
  Activity,
  Zap,
} from "lucide-react";

const StreamsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Storage Balance Overview */}
        <div className="mb-6">
          <StorageBalance />
        </div>

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-6">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Database className="h-4 w-4" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 hidden lg:flex">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <FileUploadForm />
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <div className="max-w-5xl mx-auto">
              <DataViewer />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Storage Used
                  </CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xl font-bold text-blue-600">2.4 GB</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: "24%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Datasets
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xl font-bold text-green-600">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new this week
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array(12)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-green-600 rounded-full opacity-60"
                        ></div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Network Health
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xl font-bold text-green-600 flex items-center gap-2">
                    100%
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Storage Usage Over Time
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Track your storage consumption patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-[150px] rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs">
                        Analytics chart coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your latest uploads and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">
                          Video uploaded successfully
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">Dataset created</p>
                        <p className="text-xs text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">Payment processed</p>
                        <p className="text-xs text-muted-foreground">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 max-w-4xl mx-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Storage Preferences
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure your default storage settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Enable CDN</div>
                      <div className="text-xs text-muted-foreground">
                        Use CDN for faster content delivery
                      </div>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Auto-backup</div>
                      <div className="text-xs text-muted-foreground">
                        Automatically backup to multiple providers
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Network Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Configure your Filecoin network preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Current Network</div>
                      <div className="text-xs text-muted-foreground">
                        Filecoin Calibration Testnet
                      </div>
                    </div>
                    <Badge variant="secondary">Testnet</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">
                        Storage Duration
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Default storage period for new uploads
                      </div>
                    </div>
                    <Badge variant="outline">30 days</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center max-w-5xl mx-auto">
          <Separator className="mb-6" />
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Decentralized Storage</h4>
              <p className="text-xs text-muted-foreground">
                Content stored across multiple Filecoin network nodes for
                maximum redundancy.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Permanent Storage</h4>
              <p className="text-xs text-muted-foreground">
                Cryptographically secured and stored permanently on blockchain.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Fast Retrieval</h4>
              <p className="text-xs text-muted-foreground">
                Instant access with CDN-powered global distribution network.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Filecoin Network Active
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Synapse SDK v0.29.1
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              Stream Verse v1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamsPage;
