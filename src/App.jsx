import React, { useState } from "react";

// Llyods & Partners International — Full Website Styling Version
// Clean, modern UI with hero section, improved layout, spacing, and brand identity.

export default function LlyodsTrackingApp() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("home");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);


  function validateInput(input) {
    const cleaned = input.trim();
    if (!cleaned) return "Please enter a tracking number.";
    if (!/^[A-Za-z0-9-]+$/.test(cleaned)) return "Tracking number must be alphanumeric.";
    if (cleaned.length < 8 || cleaned.length > 30) return "Tracking number looks invalid.";
    return "";
  }

  function lookupTracking(number) {
    setLoading(true);
    setError("");
    setResult(null);

    // Simulate loading for 3-5 seconds
    const delay = Math.random() * 2000 + 3000; // 3-5 seconds in milliseconds

    setTimeout(() => {
      // Call backend API
      fetch('http://localhost:5000/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: number.trim().toUpperCase() })
      })
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data.success) {
            setResult(data.data);
          } else {
            setError(data.message || 'Unable to find shipment.');
          }
        })
        .catch(error => {
          setLoading(false);
          console.error('Tracking error:', error);
          setError('Unable to connect to tracking service. Please try again later.');
        });
    }, delay);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validateInput(trackingNumber);
    if (v) return setError(v);
    lookupTracking(trackingNumber);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString();
  }

  function handleContactChange(e) {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    setContactError("");
    setContactSuccess(false);

    // Validation
    if (!contactForm.name.trim()) {
      setContactError("Please enter your name.");
      return;
    }
    if (!contactForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      setContactError("Please enter a valid email address.");
      return;
    }
    if (!contactForm.phone.trim()) {
      setContactError("Please enter your phone number.");
      return;
    }
    if (!contactForm.subject.trim()) {
      setContactError("Please enter a subject.");
      return;
    }
    if (!contactForm.message.trim()) {
      setContactError("Please enter your message.");
      return;
    }

    // Simulate form submission
    console.log("Contact form submitted:", contactForm);
    setContactSuccess(true);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    // Reset success message after 5 seconds
    setTimeout(() => {
      setContactSuccess(false);
    }, 5000);
  }

  function NavButton({ label, value }) {
    return (
      <button
        onClick={() => setPage(value)}
        className={`px-4 py-2 text-sm font-semibold transition rounded-md ${
          page === value
            ? "bg-blue-900 text-white shadow"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* TOP NAV BAR */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="./lloyds and partners logo.png"
              alt="Llyods & Partners International Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-extrabold text-blue-900 tracking-wide">
              Llyods & Partners International
            </h1>
          </div>

          <nav className="flex gap-3">
            <NavButton label="Home" value="home" />
            <NavButton label="Track" value="track" />
            <NavButton label="Services" value="services" />
            <NavButton label="About Us" value="about" />
            <NavButton label="Contact" value="contact" />
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* HOME PAGE */}
        {page === "home" && (
          <div className="space-y-10">
            {/* HERO SECTION */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-12 shadow-lg">
              <h2 className="text-5xl font-bold mb-4">Precious Cargo. Premium Service.</h2>
              <p className="text-lg text-blue-100 max-w-3xl leading-relaxed">
                Since 1996, Llyods & Partners International has specialized in secure, discreet shipping of precious materials, rare minerals, gemstones, and high-value cargo worldwide. From Dubai to the globe, we deliver trust.
              </p>
              <div className="mt-8 flex gap-4">
                <button onClick={() => setPage("services")} className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                  Explore Services
                </button>
                <button onClick={() => setPage("track")} className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition">
                  Track Shipment
                </button>
              </div>
            </section>

            {/* WHY CHOOSE US - KEY FEATURES */}
            <section>
              <h3 className="text-3xl font-bold text-blue-900 mb-8 text-center">Why Choose Llyods & Partners?</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                  <div className="text-4xl mb-3">💎</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Specialized Expertise</h4>
                  <p className="text-gray-700 text-sm">Nearly 3 decades handling precious materials with precision and care.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                  <div className="text-4xl mb-3">🔐</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Maximum Security</h4>
                  <p className="text-gray-700 text-sm">Armored transport, vault storage, and 24/7 monitoring for complete protection.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                  <div className="text-4xl mb-3">🤫</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Discreet & Private</h4>
                  <p className="text-gray-700 text-sm">Confidential routing, anonymous labeling, and strict information control.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                  <div className="text-4xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Full Chain of Custody</h4>
                  <p className="text-gray-700 text-sm">Documented tracking from origin to destination ensuring complete accountability.</p>
                </div>
              </div>
            </section>

            {/* COMPANY STATS */}
            <section className="bg-blue-900 text-white rounded-xl p-10">
              <h3 className="text-2xl font-bold mb-8 text-center">Trusted by Global Clients</h3>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">28+</div>
                  <p className="text-blue-100">Years of Excellence</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">1996</div>
                  <p className="text-blue-100">Founded</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">100+</div>
                  <p className="text-blue-100">Countries Served</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">100%</div>
                  <p className="text-blue-100">Family-Operated</p>
                </div>
              </div>
            </section>

            {/* SPECIALIZATIONS */}
            <section>
              <h3 className="text-3xl font-bold text-blue-900 mb-8 text-center">Our Specializations</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl">
                  <div className="text-4xl mb-3">💎</div>
                  <h4 className="font-bold text-xl text-blue-900 mb-3">Precious Materials</h4>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>✓ Gemstones & Diamonds</li>
                    <li>✓ Rare Minerals & Crystals</li>
                    <li>✓ Precious Metals</li>
                    <li>✓ Geological Specimens</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl">
                  <div className="text-4xl mb-3">✈️</div>
                  <h4 className="font-bold text-xl text-blue-900 mb-3">High-Security Transport</h4>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>✓ Armored Ground Transport</li>
                    <li>✓ Priority Air Freight</li>
                    <li>✓ Escorted Courier Service</li>
                    <li>✓ Vault-Level Storage</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl">
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="font-bold text-xl text-blue-900 mb-3">Regulatory Support</h4>
                  <ul className="text-gray-700 space-y-2 text-sm">
                    <li>✓ Customs Compliance</li>
                    <li>✓ Export Documentation</li>
                    <li>✓ Valuations & Certification</li>
                    <li>✓ Insurance Facilitation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CTA SECTION */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-10 text-center">
              <h3 className="text-3xl font-bold mb-4">Ready to Ship Your Precious Cargo?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Contact us for a custom quote or to discuss your specific shipping needs. Our team is available 24/7.
              </p>
              <button onClick={() => setPage("contact")} className="bg-white text-blue-900 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition">
                Get in Touch
              </button>
            </section>
          </div>
        )}

        {/* TRACK PAGE */}
        {page === "track" && (
          <div className="space-y-8">
            {/* HERO SECTION */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-12">
              <h2 className="text-4xl font-bold mb-4">Track Your Precious Cargo</h2>
              <p className="text-xl text-blue-100">
                Real-time visibility of your shipment with complete chain-of-custody documentation and security updates at every stage of transit.
              </p>
            </section>

            {/* TRACKING FORM */}
            <section className="bg-white rounded-xl shadow-lg p-10 max-w-3xl mx-auto w-full">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Enter Tracking Number</h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="tracking-number" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    id="tracking-number"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200 text-lg"
                    placeholder="Enter your tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition text-lg"
                >
                  {loading ? "Checking Shipment..." : "Track Shipment"}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-800 font-semibold">✗ {error}</p>
                </div>
              )}

              {result && (
                <div className="mt-8 space-y-6">
                  {/* SHIPMENT DETAILS */}
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-4">Shipment Details</h4>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                        <p className="text-lg font-bold text-blue-900">{result.number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Status</p>
                        <p className="text-lg font-bold text-green-700">{result.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Origin</p>
                        <p className="text-lg font-bold text-gray-900">{result.origin}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Destination</p>
                        <p className="text-lg font-bold text-gray-900">{result.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                        <p className="text-lg font-bold text-gray-900">{formatDate(result.expectedDelivery)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Weight</p>
                        <p className="text-lg font-bold text-gray-900">{result.weight}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Service Type</p>
                        <p className="text-lg font-bold text-gray-900">{result.service}</p>
                      </div>
                    </div>
                  </div>

                  {/* TRACKING HISTORY */}
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-4">Transit History</h4>
                    <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                      <div className="space-y-6">
                        {result.events.map((ev, idx) => (
                          <div key={idx} className="flex gap-6">
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 bg-blue-900 rounded-full border-4 border-blue-100"></div>
                              {idx < result.events.length - 1 && <div className="w-1 h-16 bg-blue-200 my-2"></div>}
                            </div>
                            <div className="pb-4">
                              <p className="font-bold text-blue-900 text-lg">{ev.location}</p>
                              <p className="text-gray-600 text-sm mb-1">{formatDate(ev.date)}</p>
                              <p className="text-gray-700">{ev.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* INFO SECTION */}
            <section className="bg-blue-50 rounded-xl p-10">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">How Our Tracking Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">📍</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Real-Time Location</h4>
                  <p className="text-gray-700 text-sm">Know exactly where your precious cargo is at every moment of its journey.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">🔐</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Security Status</h4>
                  <p className="text-gray-700 text-sm">Receive alerts and updates on security measures and chain-of-custody confirmations.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Documentation</h4>
                  <p className="text-gray-700 text-sm">Access complete custody records and compliance documentation on demand.</p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* SERVICES PAGE */}
        {page === "services" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-12">
              <h2 className="text-4xl font-bold mb-4">Premium Shipping Services</h2>
              <p className="text-xl text-blue-100">
                Specialized logistics solutions for precious materials, high-value cargo, and confidential shipments worldwide
              </p>
            </section>

            {/* Services Grid */}
            <section className="space-y-6">
              {/* Service 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-900">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">💎</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Global Precious Cargo Transport</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Secure international shipping of precious materials—including gemstones, rare minerals, precious metals, and high-value geological specimens—from Dubai to clients worldwide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">✈️</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">High-Security Air Freight</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Priority, monitored air transport designed for valuables that require speed and maximum security. Includes sealed containers, tracking, and controlled handling at every stage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">🚓</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Armored & Escorted Ground Transport</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Secure movement of precious cargo within the UAE and designated global routes using armored vehicles and trained security escorts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 4 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">🔐</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Discreet, Confidential Logistics</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Low-profile shipping designed to protect client privacy, with confidential routing, anonymous labeling when required, and strict information control.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 5 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-orange-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">📦</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Custom Packaging & Preservation</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Specialized packaging solutions to ensure the physical safety of sensitive materials—shock-resistant cases, climate-stable containers, and tamper-evident seals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 6 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-indigo-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">🏦</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Vault-Level Storage & Warehousing</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Short-term and long-term secure storage in high-grade vault facilities in Dubai, including 24/7 monitoring and controlled access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 7 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-cyan-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">📋</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Customs & Compliance for Precious Materials</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Expert guidance through the complex regulatory requirements for exporting and importing high-value minerals and stones, ensuring full compliance with global trade rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 8 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-pink-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">🔗</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Chain-of-Custody Management</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Documented, transparent tracking of every handoff and movement of cargo to guarantee authenticity, integrity, and accountability from origin to destination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 9 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-teal-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">🛡️</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Insurance Facilitation for High-Value Cargo</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Support with arranging specialized insurance for precious materials in transit, tailored to the item's value, destination, and risk profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service 10 */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-yellow-600">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">📑</div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">Valuation & Documentation Support</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Assistance with certified valuations, export documentation, declarations, and compliance paperwork required for international transport of precious goods.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-blue-50 rounded-xl p-10">
              <h3 className="text-3xl font-bold text-blue-900 mb-8 text-center">Why Choose Llyods & Partners for Precious Cargo?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Specialized Expertise</h4>
                  <p className="text-gray-700 text-sm">Nearly three decades of experience handling high-value, sensitive materials with precision and care.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Confidentiality & Discretion</h4>
                  <p className="text-gray-700 text-sm">Family-operated approach ensures your precious materials receive private, discreet handling at all times.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Complete Security</h4>
                  <p className="text-gray-700 text-sm">From armored transport to vault storage, we provide comprehensive security at every stage.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Full Documentation</h4>
                  <p className="text-gray-700 text-sm">Complete chain-of-custody records ensure transparency and protect your interests every step of the way.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Compliance & Regulatory</h4>
                  <p className="text-gray-700 text-sm">Expert knowledge of international regulations for precious materials ensures smooth, compliant transport.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl mb-3">✓</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">24/7 Global Support</h4>
                  <p className="text-gray-700 text-sm">Round-the-clock monitoring and support for your shipments, wherever they're going in the world.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ABOUT */}
        {page === "about" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-12">
              <h2 className="text-4xl font-bold mb-6">About Llyods & Partners International</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                A trusted leader in regional and international shipping, built on nearly three decades of excellence, integrity, and family legacy.
              </p>
            </section>

            {/* Company History */}
            <section className="bg-white rounded-xl shadow-lg p-10">
              <div className="space-y-8">
                {/* Founded */}
                <div className="border-l-4 border-blue-900 pl-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">🏛️ Our Heritage</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Founded in 1996, Llyods & Partners International has grown from a small, family-run operation into a trusted leader in regional and international shipping. Built on long-standing partnerships and a strong family legacy, the company has maintained a reputation for reliability, integrity, and personal service for nearly three decades.
                  </p>
                </div>

                {/* Core Philosophy */}
                <div className="border-l-4 border-green-600 pl-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">💼 Our Philosophy</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    From its earliest days, the business has been guided by the belief that shipping is more than moving cargo—it's about safeguarding what matters to people and businesses. That commitment shows in the company's careful handling of all types of freight, including high-value and sensitive materials.
                  </p>
                </div>

                {/* Specialization */}
                <div className="border-l-4 border-purple-600 pl-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">💎 Specialized Services</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Over the years, Llyods & Partners has become a preferred transporter for specialized goods such as precious stones, minerals, and other valuable cargo requiring heightened security, precision logistics, and discreet delivery. We understand that some shipments demand more than standard care—they require trust and expertise.
                  </p>
                </div>

                {/* Success Formula */}
                <div className="border-l-4 border-orange-600 pl-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">🤝 Our Success Formula</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The company's success is rooted in long-term relationships, both within its leadership and with its clients. As a family-and-partner–operated enterprise, decisions are made with accountability, continuity, and a hands-on approach that large carriers can't replicate. With a seasoned team, modern transport capabilities, and a culture of responsibility, Llyods & Partners continues to set a high standard for trustworthy, high-care shipping services.
                  </p>
                </div>
              </div>
            </section>

            {/* Key Values */}
            <section className="bg-gray-50 rounded-xl p-10">
              <h3 className="text-3xl font-bold text-blue-900 mb-8 text-center">Our Core Values</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">🛡️</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Reliability</h4>
                  <p className="text-gray-700">Consistent, dependable service you can count on, every single time.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">⭐</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Integrity</h4>
                  <p className="text-gray-700">Honest dealings, transparent operations, and personal accountability.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">👥</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Personal Service</h4>
                  <p className="text-gray-700">Family-run care and attention that large carriers simply cannot match.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-4xl mb-3">🔒</div>
                  <h4 className="font-bold text-lg text-blue-900 mb-2">Security</h4>
                  <p className="text-gray-700">Heightened protection for valuable and sensitive cargo, always.</p>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="bg-blue-900 text-white rounded-xl p-10">
              <h3 className="text-3xl font-bold mb-8 text-center">By The Numbers</h3>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">28+</div>
                  <p className="text-blue-100">Years of Experience</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">1996</div>
                  <p className="text-blue-100">Founded</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">100%</div>
                  <p className="text-blue-100">Family-Operated</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">∞</div>
                  <p className="text-blue-100">Commitment</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* CONTACT */}
        {page === "contact" && (
          <section className="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Contact Us</h2>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-3">📍 Office</h3>
                <p className="text-gray-700">Al Maktoom Cargo Tower</p>
                <p className="text-gray-700">Dubai Logistics District</p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-3">✉️ Email</h3>
                <p className="text-gray-700">support@llyodsintl.com</p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-3">☎️ Phone</h3>
                <p className="text-gray-700">+971 4 555 9231</p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900 mb-3">🕒 Hours</h3>
                <p className="text-gray-700">8:00 AM – 8:00 PM GST</p>
              </div>
            </div>

            <hr className="my-8" />

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-800 font-semibold">✓ Thank you! Your message has been sent successfully.</p>
                    <p className="text-green-700 text-sm">We'll get back to you as soon as possible.</p>
                  </div>
                )}

                {contactError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800 font-semibold">✗ {contactError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Shipping Quote">Shipping Quote</option>
                      <option value="Tracking Issue">Tracking Issue</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Partnership">Partnership Opportunity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    rows="5"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-200 resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white text-center py-4 mt-10">
        <p className="text-sm">© {new Date().getFullYear()} Llyods & Partners International — Dubai, UAE</p>
      </footer>
    </div>
  );
}
