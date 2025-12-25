import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: "Syelope – AI Characters That Listen & Care",
  description: "Syelope is a private AI character chat platform where users can talk freely, feel understood, and connect emotionally with AI characters.",
  openGraph: {
    title: "Syelope – AI Characters That Listen & Care",
    description: "Syelope is a private AI character chat platform where users can talk freely, feel understood, and connect emotionally with AI characters.",
  }
};

export default function Home() {
  return <HomeClient />;
}
