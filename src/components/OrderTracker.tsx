"use client";

import { motion } from "framer-motion";
import { Check, Clock, CreditCard, ChefHat, PackageCheck, Truck, PartyPopper, XCircle } from "lucide-react";
import { trackerSteps, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const STEP_ICON: Record<OrderStatus, typeof Clock> = {
  received: Clock,
  paid: CreditCard,
  preparing: ChefHat,
  ready: PackageCheck,
  out_for_delivery: Truck,
  completed: PartyPopper,
  cancelled: XCircle,
};

export function OrderTracker({ status, orderType }: { status: OrderStatus; orderType: "pickup" | "delivery" }) {
  const steps = trackerSteps(orderType);

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-tomato-50 border border-tomato-200 p-5 text-tomato-700">
        <XCircle size={24} />
        <div>
          <p className="font-bold">Order Cancelled</p>
          <p className="text-sm">This order was cancelled. Contact us if you have any questions.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0 sm:gap-2">
      {steps.map((step, i) => {
        const Icon = STEP_ICON[step];
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === steps.length - 1;
        return (
          <div key={step} className="flex sm:flex-col items-center sm:items-center flex-1 gap-3 sm:gap-2">
            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-full">
              <motion.div
                initial={false}
                animate={active ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2",
                  done ? "bg-jungle-600 border-jungle-600 text-white" : active ? "bg-gold-400 border-gold-400 text-jungle-950" : "bg-white border-jungle-200 text-jungle-300"
                )}
              >
                {done ? <Check size={18} /> : <Icon size={18} />}
              </motion.div>
              {!isLast && (
                <div className="hidden sm:block flex-1 h-0.5 w-full bg-jungle-100 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-jungle-500"
                  />
                </div>
              )}
            </div>
            <p className={cn("text-xs sm:text-center sm:mt-1 font-semibold", active ? "text-jungle-950" : done ? "text-jungle-600" : "text-jungle-300")}>
              {ORDER_STATUS_LABEL[step]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
