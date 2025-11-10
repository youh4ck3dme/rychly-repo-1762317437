import React, { useState, useEffect } from "react";
import { useTranslation } from "../../lib/i18n.tsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Clock,
  Loader2,
} from "lucide-react";
import type { Tab } from "../../types";
import { TikTokIcon } from "../ui/TikTokIcon";
import { serviceCategories } from "../../data/products";

const isSalonOpenNow = (): boolean => {
  const now = new Date();
  const day = now.getDay(); // Sunday = 0, Monday = 1, etc.
  const hour = now.getHours();

  // MON-FRI (1-5)
  if (day >= 1 && day <= 5) {
    // 08:00 - 17:00 (8 AM to before 5 PM)
    if (hour >= 8 && hour < 17) {
      return true;
    }
  }
  return false;
};

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler.
const TeamMemberCard = React.memo(
  ({
    name,
    skills,
    image,
    i18nNameKey,
    i18nTitleKey,
    i18nBioKey,
    i18nSkillKeys,
  }: any) => {
    const { t } = useTranslation();
    return (
      <motion.div
        className="bg-gray-900 rounded-lg p-4 flex flex-col items-center text-center shadow-lg hover:shadow-yellow-400/20"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-2 border-yellow-300/50"
          loading="lazy"
        />
        <h4 className="font-bold text-lg mt-4">{t(i18nNameKey)}</h4>
        <p className="text-xs text-yellow-300 font-semibold tracking-widest">
          {t(i18nTitleKey)}
        </p>
        <p className="text-sm text-gray-400 mt-2 text-balance">
          {t(i18nBioKey)}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {skills.map((skill: string, index: number) => (
            <span
              key={skill}
              className="text-xs bg-gray-800 px-2 py-1 rounded-full"
            >
              {t(i18nSkillKeys[index])}
            </span>
          ))}
        </div>
      </motion.div>
    );
  },
);

const openBookingLink = () => {
  window.open(
    "https://services.bookio.com/papi-hair-design/widget?lang=sk",
    "_blank",
    "noopener,noreferrer",
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const AboutScreen = React.memo(
  ({ onTabChange }: { onTabChange: (tab: Tab) => void }) => {
    const { t } = useTranslation();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: "",
      phone: "",
      email: "",
      service: "",
      message: "",
      honeypot: "",
      timestamp: Date.now(),
    });
    const [formErrors, setFormErrors] = useState({
      name: "",
      email: "",
      message: "",
    });

    const allServices = serviceCategories.flatMap((category) =>
      category.subcategories.flatMap((sub) =>
        sub.items.map((item) => ({
          name: `${sub.name} - ${item.name}`,
          price: item.price,
        })),
      ),
    );

    useEffect(() => {
      setIsOpen(isSalonOpenNow());
      const interval = setInterval(() => setIsOpen(isSalonOpenNow()), 60000); // Re-check every minute
      return () => clearInterval(interval);
    }, []);

    const handleInputChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));

      if (id === "name" || id === "email" || id === "message") {
        let error = "";
        if (id === "name") {
          if (!value.trim()) error = t("contact.form.error.required.name");
        } else if (id === "email") {
          if (!value.trim()) {
            error = t("contact.form.error.required.email");
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            error = t("contact.form.error.invalid.email");
          }
        } else if (id === "message") {
          if (!value.trim()) error = t("contact.form.error.required.message");
        }
        setFormErrors((prev) => ({ ...prev, [id]: error }));
      }
    };

    const validateForm = () => {
      const errors = { name: "", email: "", message: "" };
      let isValid = true;
      if (!formData.name.trim()) {
        errors.name = t("contact.form.error.required.name");
        isValid = false;
      }
      if (!formData.email.trim()) {
        errors.email = t("contact.form.error.required.email");
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = t("contact.form.error.invalid.email");
        isValid = false;
      }
      if (!formData.message.trim()) {
        errors.message = t("contact.form.error.required.message");
        isValid = false;
      }
      setFormErrors(errors);
      return isValid;
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
        setIsSubmitting(true);

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (result.success) {
            setFormSubmitted(true);
            setFormData({
              name: "",
              phone: "",
              email: "",
              service: "",
              message: "",
              honeypot: "",
              timestamp: Date.now(),
            }); // Reset form
            setFormErrors({ name: "", email: "", message: "" }); // Reset errors
          } else {
            // Zobrazenie chyby používateľovi
            alert(
              result.error ||
                "Nastala chyba pri odosielaní správy. Skúste to znovu.",
            );
          }
        } catch (error) {
          console.error("Chyba pri odosielaní formulára:", error);
          alert("Nastala chyba pri odosielaní správy. Skúste to znovu neskôr.");
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    return (
      <div className="flex flex-col flex-grow bg-black text-white relative">
        <AnimatePresence>
          {formSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 p-8 rounded-lg text-center shadow-lg max-w-sm w-full"
              >
                <h3 className="text-xl font-bold text-yellow-300">
                  {t("contact.form.submitted.title")}
                </h3>
                <p className="text-gray-300 mt-2 mb-6">
                  {t("contact.form.submitted.message")}
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="bg-white text-black font-bold py-2 px-8 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {t("contact.form.submitted.close")}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-grow">
          {/* About Us Section */}
          <section className="p-6">
            <h1 className="text-3xl font-bold text-center mb-4 tracking-wide">
              {t("about.title")}
            </h1>
            <p className="text-center text-gray-300 text-balance max-w-2xl mx-auto">
              {t("about.intro")}
            </p>
            <div className="flex gap-2 mt-6 max-w-sm mx-auto">
              <button
                onClick={openBookingLink}
                className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("about.book")}
              </button>
              <button
                onClick={() => onTabChange("services")}
                className="flex-1 bg-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                {t("about.viewServices")}
              </button>
            </div>
          </section>

          <section className="bg-gray-900 p-6 mt-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-4 tracking-wide">
                  {t("about.philosophy.title")}
                </h2>
                <p className="text-gray-300 text-balance">
                  {t("about.philosophy.text")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-6 lg:mt-0">
                <div>
                  <p className="font-bold text-xl">
                    {t("about.stats.clients").split(" ")[0]}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("about.stats.clients").substring(
                      t("about.stats.clients").indexOf(" ") + 1,
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-xl">
                    {t("about.stats.experience").split(" ")[0]}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("about.stats.experience").substring(
                      t("about.stats.experience").indexOf(" ") + 1,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6">
            <h2 className="text-2xl font-bold text-center mb-2 tracking-wide">
              {t("about.team.title")}
            </h2>
            <p className="text-center text-sm text-gray-400 mb-6">
              {t("about.team.intro")}
            </p>
            <motion.div
              className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={itemVariants}>
                <TeamMemberCard
                  image="/assets/images/papi.webp"
                  i18nNameKey="about.team.papi.name"
                  i18nTitleKey="about.team.papi.title"
                  i18nBioKey="about.team.papi.bio"
                  skills={[
                    "Premium cutting",
                    "Styling",
                    "Color",
                    "Creative hairstyles",
                  ]}
                  i18nSkillKeys={[
                    "about.team.papi.skills.1",
                    "about.team.papi.skills.2",
                    "about.team.papi.skills.3",
                    "about.team.papi.skills.4",
                  ]}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TeamMemberCard
                  image="/assets/images/mato.webp"
                  i18nNameKey="about.team.mato.name"
                  i18nTitleKey="about.team.mato.title"
                  i18nBioKey="about.team.mato.bio"
                  skills={[
                    "Men's cuts",
                    "Beard & mustache",
                    "Classic cuts",
                    "Fade techniques",
                  ]}
                  i18nSkillKeys={[
                    "about.team.mato.skills.1",
                    "about.team.mato.skills.2",
                    "about.team.mato.skills.3",
                    "about.team.mato.skills.4",
                  ]}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TeamMemberCard
                  image="/assets/images/miska.webp"
                  i18nNameKey="about.team.miska.name"
                  i18nTitleKey="about.team.miska.title"
                  i18nBioKey="about.team.miska.bio"
                  skills={[
                    "Women's cuts",
                    "Highlights & color",
                    "Styling",
                    "Modern trends",
                  ]}
                  i18nSkillKeys={[
                    "about.team.miska.skills.1",
                    "about.team.miska.skills.2",
                    "about.team.miska.skills.3",
                    "about.team.miska.skills.4",
                  ]}
                />
              </motion.div>
            </motion.div>
          </section>

          <section className="bg-gray-900 p-6 mt-6 text-center">
            <h2 className="text-2xl font-bold tracking-wide">
              {t("about.cta.title")}
            </h2>
            <p className="text-gray-300 mt-2">{t("about.cta.text")}</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 max-w-sm mx-auto">
              <button
                onClick={openBookingLink}
                className="w-full bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("about.cta.bookOnline")}
              </button>
              <a
                href="tel:+421949459624"
                className="w-full bg-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                {t("about.cta.call")}
              </a>
            </div>
          </section>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
            {/* Contact Section */}
            <section className="p-6">
              <h2 className="text-3xl font-bold text-center mb-4 tracking-wide">
                {t("contact.title")}
              </h2>
              <p className="text-center text-gray-300 text-balance">
                {t("contact.intro")}
              </p>

              <div className="space-y-4 mt-8">
                <div className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
                  <Phone size={20} className="text-yellow-300" />
                  <div>
                    <h4 className="font-bold">{t("contact.phone.title")}</h4>
                    <a
                      href="tel:+421949459624"
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      +421 949 459 624
                    </a>
                    <p className="text-xs text-gray-500">
                      {t("contact.phone.hours")}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
                  <Mail size={20} className="text-yellow-300" />
                  <div>
                    <h4 className="font-bold">{t("contact.email.title")}</h4>
                    <a
                      href="mailto:info@papihairdesign.sk"
                      className="text-sm text-gray-300 hover:text-white"
                    >
                      info@papihairdesign.sk
                    </a>
                    <p className="text-xs text-gray-500">
                      {t("contact.email.response")}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
                  <MapPin size={20} className="text-yellow-300" />
                  <div>
                    <h4 className="font-bold">{t("contact.address.title")}</h4>
                    <p className="text-sm text-gray-300">
                      {t("contact.address.location")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <h4 className="font-bold">{t("contact.booking.title")}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {t("contact.booking.text")}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={openBookingLink}
                    className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {t("contact.booking.online")}
                  </button>
                  <a
                    href="tel:+421949459624"
                    className="flex-1 bg-gray-800 font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    {t("contact.booking.call")}
                  </a>
                </div>
              </div>
            </section>

            <section className="bg-gray-900 p-6 mt-6 lg:mt-0 lg:rounded-lg">
              <h2 className="text-2xl font-bold text-center mb-4 tracking-wide">
                {t("contact.form.title")}
              </h2>
              <form
                onSubmit={handleFormSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Honeypot pole - skryté pred používateľmi, ale viditeľné pre botov */}
                <div style={{ display: "none" }}>
                  <label htmlFor="honeypot">
                    Nenechávajte toto pole prázdne
                  </label>
                  <input
                    type="text"
                    id="honeypot"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleInputChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-bold text-gray-400"
                    htmlFor="name"
                  >
                    {t("contact.form.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={t("contact.form.name.placeholder")}
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full mt-1 bg-gray-800 p-3 rounded-md border ${formErrors.name ? "border-red-500" : "border-gray-700"} focus:ring-yellow-300 focus:border-yellow-300`}
                  />
                  {formErrors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="text-sm font-bold text-gray-400"
                    htmlFor="phone"
                  >
                    {t("contact.form.phone")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder={t("contact.form.phone.placeholder")}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full mt-1 bg-gray-800 p-3 rounded-md border border-gray-700 focus:ring-yellow-300 focus:border-yellow-300"
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-bold text-gray-400"
                    htmlFor="email"
                  >
                    {t("contact.form.email")}
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t("contact.form.email.placeholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full mt-1 bg-gray-800 p-3 rounded-md border ${formErrors.email ? "border-red-500" : "border-gray-700"} focus:ring-yellow-300 focus:border-yellow-300`}
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="text-sm font-bold text-gray-400"
                    htmlFor="service"
                  >
                    {t("contact.form.service")}
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full mt-1 bg-gray-800 p-3 rounded-md border border-gray-700 focus:ring-yellow-300 focus:border-yellow-300"
                  >
                    <option value="">
                      {t("contact.form.service.placeholder")}
                    </option>
                    {allServices.map((service) => (
                      <option key={service.name} value={service.name}>
                        {`${service.name} (${service.price})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="text-sm font-bold text-gray-400"
                    htmlFor="message"
                  >
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder={t("contact.form.message.placeholder")}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full mt-1 bg-gray-800 p-3 rounded-md border ${formErrors.message ? "border-red-500" : "border-gray-700"} focus:ring-yellow-300 focus:border-yellow-300`}
                  ></textarea>
                  {formErrors.message && (
                    <p className="text-red-400 text-xs mt-1">
                      {formErrors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    t("contact.form.submit")
                  )}
                </button>
              </form>
            </section>
          </div>

          <section className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 tracking-wide">
              {t("contact.hours.title")}
            </h2>
            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <div className="flex justify-between gap-8 border-b border-gray-700 pb-2">
                <span className="font-bold">{t("contact.hours.weekdays")}</span>
                <span>08:00 - 17:00</span>
              </div>
              <div className="flex justify-between gap-8 pt-2">
                <span className="font-bold">{t("contact.hours.weekends")}</span>
                <span>{t("contact.hours.closed")}</span>
              </div>
            </div>
            {isOpen ? (
              <p className="text-sm text-green-400 font-bold mt-4 flex items-center justify-center gap-2">
                <Clock size={16} /> {t("contact.hours.open")}
              </p>
            ) : (
              <p className="text-sm text-red-400 font-bold mt-4 flex items-center justify-center gap-2">
                <Clock size={16} /> {t("contact.hours.closedDynamic")}
              </p>
            )}
          </section>

          <section className="bg-gray-900 p-6 mt-6 text-center">
            <h2 className="text-2xl font-bold tracking-wide">
              {t("contact.social.title")}
            </h2>
            <p className="text-gray-300 mt-2 mb-4">
              {t("contact.social.text")}
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.instagram.com/papi_hair_design/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Instagram />
              </a>
              <a
                href="https://www.tiktok.com/@papi_hair_design?_t=ZN-900K0AEZh3e&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="https://www.facebook.com/papihairdesign/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Facebook />
              </a>
            </div>
          </section>

          <div className="pb-8"></div>
        </main>
      </div>
    );
  },
);
