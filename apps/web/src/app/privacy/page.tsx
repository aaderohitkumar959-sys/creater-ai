import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Account information (email address, name)</li>
                        <li>Chat history and interactions with AI characters</li>
                        <li>Payment transaction history (we do not store full credit card numbers)</li>
                        <li>Communications you send to us</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Provide, maintain, and improve the Service</li>
                        <li>Process transactions and manage your Coin wallet</li>
                        <li>Generate AI responses and maintain conversation context</li>
                        <li>Detect and prevent fraud or abuse</li>
                        <li>Communicate with you about updates and support</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
                    <p>
                        We do not sell your personal data. We may share data with:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Service providers (e.g., payment processors, AI model providers)</li>
                        <li>Legal authorities if required by law</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Note: Chat content is processed by our AI providers (e.g., Groq) to generate responses.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                    <p>
                        We implement reasonable security measures to protect your information. However, no method of transmission
                        over the Internet is 100% secure.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
                    <p>
                        You may request access to or deletion of your personal data by contacting us. You can also manage
                        your account settings within the application.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at support@creatorai.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
