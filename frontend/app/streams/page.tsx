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
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileVideo className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Stream Verse
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Upload, manage, and share your videos on the decentralized Filecoin
            network
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Cloud className="h-3 w-3" />
              Filecoin Powered
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Fast & Secure
            </Badge>
          </div>
        </div>

        {/* Storage Balance Overview */}
        <div className="mb-8">
          <StorageBalance />
        </div>

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-8">
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
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New Video
                </CardTitle>
                <CardDescription>
                  Upload your videos to the decentralized Filecoin network for
                  permanent, censorship-resistant storage
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <FileUploadForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Video Library
                </CardTitle>
                <CardDescription>
                  Manage your uploaded videos and storage datasets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataViewer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Storage Used
                  </CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">2.4 GB</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "24%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Datasets
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new this week
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array(12)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-green-600 rounded-full opacity-60"
                        ></div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Network Health
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    100%
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Storage Usage Over Time
                  </CardTitle>
                  <CardDescription>
                    Track your storage consumption patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        Analytics chart coming soon
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest uploads and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Video uploaded successfully
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dataset created</p>
                        <p className="text-xs text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment processed</p>
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
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Preferences</CardTitle>
                  <CardDescription>
                    Configure your default storage settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                <CardHeader>
                  <CardTitle>Network Settings</CardTitle>
                  <CardDescription>
                    Configure your Filecoin network preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
      </div>
    </div>
  );
};

export default StreamsPage;
