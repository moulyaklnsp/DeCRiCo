import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Zap, 
  Users, 
  Globe, 
  TrendingUp,
  CheckCircle,
  Heart,
  Vote,
  Wallet,
  Eye,
  Award
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Requests",
      description: "Every crisis request is thoroughly verified by our community of trusted validators before being approved for donations.",
      color: "from-blue-500 to-cyan-600",
      benefits: [
        "Community-driven verification process",
        "Multi-step validation system",
        "Fraud prevention mechanisms",
        "Transparent voting system"
      ]
    },
    {
      icon: Lock,
      title: "Blockchain Security",
      description: "All transactions are secured by Ethereum blockchain technology, ensuring complete transparency and immutable donation records.",
      color: "from-purple-500 to-pink-600",
      benefits: [
        "Immutable transaction records",
        "Smart contract automation",
        "Decentralized architecture",
        "Cryptographic security"
      ]
    },
    {
      icon: Zap,
      title: "Instant Impact",
      description: "Donations reach crisis victims directly without intermediaries, ensuring maximum impact and minimal overhead costs.",
      color: "from-green-500 to-emerald-600",
      benefits: [
        "Direct peer-to-peer transfers",
        "Zero platform fees",
        "Instant fund delivery",
        "Maximum impact guarantee"
      ]
    },
    {
      icon: Vote,
      title: "Gas-Free Voting",
      description: "Community members can vote on proposals and requests without paying gas fees, making participation accessible to everyone.",
      color: "from-orange-500 to-red-600",
      benefits: [
        "No transaction costs for voting",
        "Democratic decision making",
        "Community governance",
        "Accessible participation"
      ]
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Every donation, vote, and transaction is publicly visible on the blockchain, ensuring full accountability.",
      color: "from-indigo-500 to-purple-600",
      benefits: [
        "Public transaction history",
        "Real-time tracking",
        "Audit trail maintenance",
        "Open source verification"
      ]
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with donors, verifiers, and aid recipients from around the world in our decentralized humanitarian network.",
      color: "from-teal-500 to-blue-600",
      benefits: [
        "Worldwide participation",
        "Cultural diversity",
        "24/7 global support",
        "Cross-border aid delivery"
      ]
    }
  ];

  const roles = [
    {
      title: "Donors",
      icon: Heart,
      color: "from-pink-500 to-rose-600",
      features: [
        "Browse verified crisis requests",
        "Make direct blockchain donations",
        "Vote on upcoming proposals",
        "Track donation impact",
        "View detailed analytics",
        "Connect wallet seamlessly"
      ]
    },
    {
      title: "Aid Requesters",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      features: [
        "Submit detailed aid requests",
        "Upload supporting documentation",
        "Receive funds directly to wallet",
        "Track funding progress",
        "Communicate with donors",
        "Provide impact updates"
      ]
    },
    {
      title: "Verifiers",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      features: [
        "Review and verify requests",
        "Vote on proposal legitimacy",
        "Maintain platform integrity",
        "Earn reputation points",
        "Access verification tools",
        "Community recognition"
      ]
    },
    {
      title: "Administrators",
      icon: Award,
      color: "from-purple-500 to-violet-600",
      features: [
        "Monitor platform activity",
        "Manage user accounts",
        "Oversee transactions",
        "Generate reports",
        "Maintain system health",
        "Ensure compliance"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Platform Features
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Discover the revolutionary features that make DeCriCo the most 
              advanced humanitarian aid platform powered by blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary capabilities that transform how humanitarian aid is delivered
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 flex items-center justify-center`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 bg-white/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Features by Role</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored experiences for every type of user on our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl mb-6 flex items-center justify-center`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{role.title}</h3>
                <ul className="space-y-3">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Technical Excellence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology for maximum security and efficiency
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">MetaMask Integration</h3>
              <p className="text-gray-600">
                Seamless wallet connection with MetaMask for secure transaction signing and fund management.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Multi-Network Support</h3>
              <p className="text-gray-600">
                Support for Ethereum mainnet and testnets, allowing users to choose their preferred network.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Live dashboard with real-time statistics, donation tracking, and impact measurement tools.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the Future of Aid
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join our platform and experience firsthand how blockchain technology 
              is revolutionizing humanitarian aid distribution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started Now
              </button>
              <button className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/10">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};