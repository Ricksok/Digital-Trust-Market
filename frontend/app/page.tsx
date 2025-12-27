import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Home() {
  const features = [
    {
      icon: '🛡️',
      title: 'Trust Engine',
      description: 'AI-powered trust scoring system ensuring transparency and reliability for all participants.',
    },
    {
      icon: '💰',
      title: 'Smart Escrow',
      description: 'Blockchain-based escrow services protecting investments until milestones are met.',
    },
    {
      icon: '📊',
      title: 'Reverse Auctions',
      description: 'Competitive bidding system connecting capital seekers with the best rates.',
    },
    {
      icon: '⭐',
      title: 'Guarantee Marketplace',
      description: 'Risk mitigation through guarantee providers and multi-layer coverage options.',
    },
    {
      icon: '🏛️',
      title: 'Governance',
      description: 'DAO-based governance giving stakeholders a voice in platform decisions.',
    },
    {
      icon: '🎁',
      title: 'Tokenomics',
      description: 'Reward system incentivizing positive behavior and platform participation.',
    },
  ];

  const userTypes = [
    {
      title: 'For Investors',
      description: 'Discover vetted investment opportunities with transparent risk assessment.',
      items: ['Individual Investors', 'Institutional Investors', 'Impact Funds'],
      cta: 'Browse Projects',
      href: '/projects',
    },
    {
      title: 'For Fundraisers',
      description: 'Access capital through competitive auctions with trust-based pricing.',
      items: ['SMEs & Startups', 'Social Enterprises', 'Real Estate Projects'],
      cta: 'Create Project',
      href: '/projects/create',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Digital Trust
                <span className="text-primary-600"> Marketplace</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Web3-powered platform connecting investors and fundraisers with trust, transparency, and security.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/marketplace">
                <Button size="lg" variant="primary">
                  Shop Marketplace
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're looking to invest or raise capital, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {userTypes.map((type, index) => (
              <Card key={index} variant="elevated" className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">{type.title}</CardTitle>
                  <CardDescription className="text-base">{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {type.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-gray-700">
                        <span className="text-primary-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link href={type.href}>
                      <Button variant="primary" fullWidth>
                        {type.cta}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for secure, transparent, and efficient capital markets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-100">
              Join thousands of investors and fundraisers building the future of trust-based finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Create Account
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
