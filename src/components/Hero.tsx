"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FloatingLeaves } from "./FloatingLeaves";
import { formatRM } from "@/lib/money";

export function Hero({ featuredPrice }: { featuredPrice: number }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-jungle-950 via-jungle-900 to-jungle-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(33,117,79,0.5),_transparent_60%)]" />
      <FloatingLeaves />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Image
              src="/images/logo.png"
              alt="D'Amazon Cafe toucan logo"
              width={120}
              height={120}
              priority
              className="drop-shadow-2xl mb-6"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]"
          >
            Taste the Flavours of <span className="text-gradient-gold">Malaysia</span>, Surrounded by Nature
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg text-jungle-100/90 max-w-xl"
          >
            Good Food. Great Coffee. Tropical Vibes. Nasi Lemak, coffee, tea, pastries, desserts, Western favourites
            and refreshing drinks — freshly made in Sungai Long, Cheras.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-bold text-jungle-950 shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              ORDER ONLINE
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              VIEW MENU
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 text-sm text-jungle-300"
          >
            Nasi Lemak • Coffee • Tea • Pastries • Desserts • Western Favourites • Refreshing Drinks
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, type: "spring" }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-10 rounded-full bg-gold-400/10 blur-3xl" />
          <div className="relative rounded-[2.5rem] bg-white/10 glass border border-white/20 p-6 backdrop-blur-md">
            <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-jungle-600 to-gold-500 h-56 text-7xl">
              🍚
            </div>
            <div className="mt-4">
              <span className="inline-block rounded-full bg-tomato-500 px-2.5 py-1 text-[11px] font-bold">🔥 BEST SELLER</span>
              <h3 className="mt-2 font-display text-xl font-extrabold">Nasi Lemak Ayam Rendang</h3>
              <p className="text-sm text-jungle-200">Coconut rice, rendang chicken &amp; sambal</p>
              <p className="mt-2 font-bold text-gold-300 text-lg">{formatRM(featuredPrice)}</p>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-8 rounded-2xl bg-white text-jungle-950 px-4 py-2.5 shadow-2xl text-sm font-bold"
          >
            ☕ Freshly Brewed Daily
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-cream-50" />
    </section>
  );
}
