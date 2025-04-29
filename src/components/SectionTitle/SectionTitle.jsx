import { motion } from "framer-motion";

const SectionTitle = ({ heading, subHeading }) => {
  return (
    <motion.div
      className="text-center my-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h3 className="text-lg text-gray-500 mb-2">{subHeading}</h3>
      <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        {heading}
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
    </motion.div>
  );
};

export default SectionTitle;
