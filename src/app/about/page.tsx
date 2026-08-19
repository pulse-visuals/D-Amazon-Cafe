import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Coffee, Heart, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind D'Amazon Cafe — a tropical escape for Malaysian favourites, Western comfort food, coffee and desserts in Sungai Long, Cheras.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our Story" title="A Tropical Escape for Great Food & Great Coffee" compact />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal className="flex flex-col items-center text-center">
          <Image src="/images/logo.png" alt="D'Amazon Cafe toucan logo" width={110} height={110} />
          <p className="mt-6 text-lg text-jungle-700 leading-relaxed">
            D&apos;Amazon Cafe combines Malaysian favourites, comforting Western dishes, freshly prepared beverages and
            indulgent desserts in a relaxing tropical environment. Tucked into the green canopy of Sungai Long, we built
            this cafe to feel like a little jungle escape — where good food and great coffee come with a side of fresh air.
          </p>
          <p className="mt-4 text-lg text-jungle-700 leading-relaxed">
            From our signature Nasi Lemak to carefully brewed coffee, hand-baked pastries and Western comfort classics,
            every dish on our menu is prepared fresh, every day, by a team that genuinely loves feeding people well.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {[
            { icon: Leaf, title: "Nature-Inspired", desc: "Tropical foliage, natural wood and a jungle-canopy setting." },
            { icon: Coffee, title: "Freshly Brewed", desc: "Coffee and drinks made to order, never sitting around." },
            { icon: Heart, title: "Made with Care", desc: "Recipes rooted in Malaysian tradition and home-style comfort." },
            { icon: Users, title: "Family-Friendly", desc: "A relaxed, welcoming space for everyone, every day." },
          ].map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 0.06}>
              <div className="rounded-2xl bg-jungle-50 border border-jungle-100 p-6 h-full text-center">
                <v.icon className="mx-auto text-jungle-600" size={28} />
                <h3 className="mt-3 font-display font-bold text-jungle-950">{v.title}</h3>
                <p className="mt-1 text-sm text-jungle-500">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-16 text-center">
          <h2 className="font-display text-2xl font-extrabold text-jungle-950">Come Say Hi 👋</h2>
          <p className="mt-2 text-jungle-500">We&apos;d love to have you visit us in Sungai Long, Cheras.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/location" className="rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700">
              Get Directions
            </Link>
            <Link href="/menu" className="rounded-full border-2 border-jungle-200 px-6 py-3 font-bold text-jungle-700 hover:border-jungle-400">
              Order Online
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
