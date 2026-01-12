import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "CreaterAI – AI Characters That Listen & Care",
  description: "CreaterAI is a private AI character chat platform where users can talk freely, feel understood, and connect emotionally with AI characters.",
  openGraph: {
    title: "CreaterAI – AI Characters That Listen & Care",
    description: "CreaterAI is a private AI character chat platform where users can talk freely, feel understood, and connect emotionally with AI characters.",
  }
};

export default function Home() {
  return <HomeClient />;
}
