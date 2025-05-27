import { motion } from "framer-motion";

function FloatingShape({ color, size, top, left, delay }) {
  console.log(`Classes: ${color} ${size} ${top} ${left}`);
  return (
    <motion.div
      className={`absolute rounded-full ${color} ${size} opacity-20 blur-xl ${top} ${left}`}
      animate={{
        y: ["0%", "100%", "0%"],
        x: ["0%", "100%", "0%"],
      }}
      transition={{
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        delay,
      }}
      aria-hidden="true" // is an accessibility feature that tells screen readers and other assistive technologies to ignore the element and its children
    ></motion.div>
  );
}

export default FloatingShape;
