import { LegalPage } from './LegalPage'

export default function TermsOfService({ onBack }: { onBack: () => void }) {
    return (
        <LegalPage
            onBack={onBack}
            title="Terms of Service"
            effectiveDate="May 28, 2026"
            intro={
                <>
                    <p>
                        These Terms of Service ("Terms") govern your access to and use of the Neognathae website and Weights as
                        a Service platform (collectively, the "Service"), provided by Auxerta ("Auxerta", "we", "us"). By
                        accessing or using the Service, you agree to be bound by these Terms. If you are entering into these
                        Terms on behalf of an organization, you represent that you have the authority to bind that organization,
                        and "you" refers to that organization.
                    </p>
                </>
            }
            sections={[
                {
                    id: 'eligibility',
                    heading: 'Eligibility and accounts',
                    body: (
                        <>
                            <p>
                                You must be at least 18 years old and able to enter a binding contract to use the Service. To use
                                certain features you must register for an account and provide accurate and complete information.
                                You are responsible for maintaining the confidentiality of your account credentials and for all
                                activity that occurs under your account.
                            </p>
                            <p>
                                Notify us immediately at <a href="mailto:contact@auxerta.com" className="text-[#1A1815] underline-offset-2 hover:underline">contact@auxerta.com</a> if you suspect unauthorized use of your
                                account.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'service-description',
                    heading: 'The Service',
                    body: (
                        <p>
                            The Service provides custom AI classifiers fine-tuned from our proprietary State Space Model
                            architecture on data you provide ("Customer Data"). We perform data annotation, model fine-tuning,
                            and hosted inference, and make the resulting classifier available to you via a private API
                            ("Customer Model"). The Service is provided on a subscription basis under a customer agreement and
                            these Terms.
                        </p>
                    ),
                },
                {
                    id: 'acceptable-use',
                    heading: 'Acceptable use',
                    body: (
                        <>
                            <p>You agree not to, and not to permit anyone else to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>use the Service to violate any law, regulation, or third-party right;</li>
                                <li>submit Customer Data that you do not have the lawful right to submit, or that includes
                                    sensitive categories of personal data unless we have specifically agreed in writing;</li>
                                <li>attempt to reverse-engineer, decompile, or otherwise derive the architecture, weights, or
                                    source code of any Neognathae model;</li>
                                <li>use the Service to develop a competing product or to benchmark for the purpose of marketing
                                    a competing product without our written consent;</li>
                                <li>resell, sublicense, or share access to the Service except as expressly permitted in your
                                    customer agreement;</li>
                                <li>interfere with the security, integrity, or performance of the Service or attempt to gain
                                    unauthorized access to any part of it; or</li>
                                <li>use the Service to generate or classify content that is illegal, harmful, or violates the
                                    rights or safety of any person.</li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'customer-data',
                    heading: 'Customer Data and Customer Models',
                    body: (
                        <>
                            <p>
                                <strong>You own your Customer Data.</strong> You retain all rights, title, and interest in
                                Customer Data, including any labels, annotations, or derived datasets created from it as part
                                of the Service.
                            </p>
                            <p>
                                <strong>You receive a license to your Customer Model.</strong> Subject to your payment of fees
                                and compliance with these Terms, we grant you a non-exclusive, non-transferable license to use
                                the Customer Model trained on your Customer Data during the term of your subscription, solely
                                for your own internal business purposes through the Service.
                            </p>
                            <p>
                                <strong>We retain ownership of our architecture and base models.</strong> We retain all rights,
                                title, and interest in our State Space Model architecture, base models, software, and any
                                improvements to them. Nothing in these Terms transfers ownership of those assets to you.
                            </p>
                            <p>
                                We will not use Customer Data to train models for any other customer, nor to improve our base
                                models, without your separate written consent.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'fees',
                    heading: 'Fees and payment',
                    body: (
                        <>
                            <p>
                                The Service is offered for a one-time setup fee covering annotation and fine-tuning, and a
                                recurring subscription fee for API access. Fees, billing periods, payment terms, and any usage
                                limits are set out in the order form or customer agreement applicable to you.
                            </p>
                            <p>
                                Unless otherwise stated in your order form, fees are non-refundable, are exclusive of taxes, and
                                are payable in advance. We may suspend the Service for non-payment after written notice and a
                                reasonable cure period.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'term',
                    heading: 'Term and termination',
                    body: (
                        <>
                            <p>
                                These Terms apply from the moment you first access the Service and continue until terminated.
                                Either party may terminate for material breach if the breach is not cured within thirty (30)
                                days of written notice. We may suspend or terminate access immediately if we reasonably believe
                                continued use poses a security, legal, or operational risk.
                            </p>
                            <p>
                                On termination, your right to access the Service ends. You may request export of your Customer
                                Data for a reasonable period after termination. After that period, we may delete Customer Data
                                and Customer Models in accordance with our retention policy and applicable law.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'confidentiality',
                    heading: 'Confidentiality',
                    body: (
                        <p>
                            Each party may receive confidential information from the other. Each party will use the other's
                            confidential information only as needed to perform under these Terms, will not disclose it to third
                            parties except to employees, contractors, and advisors with a need to know who are bound by similar
                            confidentiality obligations, and will protect it with at least the same degree of care it uses for
                            its own confidential information (and no less than a reasonable degree of care).
                        </p>
                    ),
                },
                {
                    id: 'warranties',
                    heading: 'Warranties and disclaimers',
                    body: (
                        <>
                            <p>
                                We will provide the Service in a professional manner consistent with general industry standards.
                                We do not warrant any particular classification accuracy, that the Service will be uninterrupted
                                or error-free, or that the Service will meet your specific requirements.
                            </p>
                            <p className="uppercase text-sm tracking-wide">
                                Except as expressly set out in these Terms, the Service is provided "as is" and "as available."
                                Auxerta disclaims all other warranties, express or implied, including warranties of
                                merchantability, fitness for a particular purpose, and non-infringement, to the maximum extent
                                permitted by law.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'liability',
                    heading: 'Limitation of liability',
                    body: (
                        <>
                            <p className="uppercase text-sm tracking-wide">
                                To the maximum extent permitted by law, neither party will be liable for any indirect,
                                incidental, special, consequential, or punitive damages, or for any loss of profits, revenue,
                                data, or business opportunities, arising out of or relating to these Terms or the Service, even
                                if advised of the possibility of such damages.
                            </p>
                            <p className="uppercase text-sm tracking-wide">
                                Auxerta's aggregate liability arising out of or relating to these Terms or the Service will not
                                exceed the amount you paid to Auxerta for the Service in the twelve (12) months preceding the
                                event giving rise to the claim.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'indemnification',
                    heading: 'Indemnification',
                    body: (
                        <p>
                            You will defend, indemnify, and hold harmless Auxerta and its affiliates, officers, employees, and
                            agents from any third-party claims, damages, liabilities, and expenses (including reasonable
                            attorneys' fees) arising out of or related to (a) your Customer Data, (b) your use of the Service in
                            violation of these Terms or applicable law, or (c) your breach of any representation, warranty, or
                            obligation in these Terms.
                        </p>
                    ),
                },
                {
                    id: 'governing-law',
                    heading: 'Governing law and disputes',
                    body: (
                        <p>
                            These Terms are governed by the laws of the State of Delaware, United States, without regard to its
                            conflict of laws principles. The parties consent to the exclusive jurisdiction of the state and
                            federal courts located in Wilmington, Delaware for any dispute arising under or related to these
                            Terms, except that either party may seek injunctive relief in any court of competent jurisdiction to
                            protect its intellectual property or confidential information.
                        </p>
                    ),
                },
                {
                    id: 'changes',
                    heading: 'Changes to these Terms',
                    body: (
                        <p>
                            We may update these Terms from time to time. If we make material changes, we will provide reasonable
                            notice (for example, by posting a notice on our website or sending you an email) before the
                            changes take effect. Continued use of the Service after the effective date constitutes acceptance of
                            the updated Terms.
                        </p>
                    ),
                },
                {
                    id: 'miscellaneous',
                    heading: 'Miscellaneous',
                    body: (
                        <>
                            <p>
                                These Terms, together with any order form or customer agreement entered between you and Auxerta,
                                constitute the entire agreement between the parties regarding the Service and supersede any
                                prior or contemporaneous understandings.
                            </p>
                            <p>
                                If any provision of these Terms is held to be unenforceable, the remaining provisions will
                                remain in full force and effect. Our failure to enforce any right or provision is not a waiver
                                of that right or provision. You may not assign these Terms without our prior written consent.
                                We may assign these Terms in connection with a merger, acquisition, financing, or sale of all
                                or substantially all of our assets.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'contact',
                    heading: 'Contact us',
                    body: (
                        <p>
                            For questions about these Terms, contact us at{' '}
                            <a href="mailto:contact@auxerta.com" className="text-[#1A1815] underline-offset-2 hover:underline">contact@auxerta.com</a>.
                        </p>
                    ),
                },
            ]}
        />
    )
}
