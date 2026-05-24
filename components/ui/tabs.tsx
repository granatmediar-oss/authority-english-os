"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextType = { value: string; setValue: (value: string) => void };
const TabsContext = React.createContext<TabsContextType | null>(null);

function Tabs({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}
function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("inline-flex rounded-2xl p-1", className)}>{children}</div>;
}
function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const active = context.value === value;
  return <button onClick={() => context.setValue(value)} className={cn("rounded-xl px-3 py-2 text-sm font-medium transition", active ? "bg-orange-500 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100", className)}>{children}</button>;
}
function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context || context.value !== value) return null;
  return <div className={className}>{children}</div>;
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
