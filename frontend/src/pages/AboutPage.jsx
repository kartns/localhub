import { useLanguage } from '../contexts/LanguageContext'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen mesh-gradient-bg transition-colors">
      <Header />

      {/* Main Content */}
      <main id="main-content" className="max-w-6xl mx-auto px-4 py-12" tabIndex="-1" aria-label="About The Local Hub">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('About The Local Hub', 'Σχετικά με το The Local Hub')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t(
              'Connecting communities with local producers. Discover the stories, people, and passion behind your favorite local products.',
              'Συνδέοντας κοινότητες με τοπικούς παραγωγούς. Ανακαλύψτε ιστορίες, ανθρώπους και πάθος πίσω από τα αγαπημένα σας προϊόντα.'
            )}
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Our Mission */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('Our Mission', 'Η Αποστολή μας')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              {t(
                'The Local Hub helps you discover local producers, and their unique products. We aim to empower communities, support sustainability, and create meaningful connections between consumers and the people behind their food.',
                'Το Local Hub σας βοηθάει να ανακαλύψετε τοπικούς παραγωγούς και τα μοναδικά τους προϊόντα. Σκοπός μας είναι να ενδυναμώνουμε κοινότητες, να υποστηρίξουμε τη βιωσιμότητα και να δημιουργούμε ουσιαστικές συνδέσεις μεταξύ καταναλωτών και παραγωγών.'
              )}
            </p>
          </section>

          {/* How It Works */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('How It Works', 'Πώς Λειτουργεί')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              {t(
                'Search for brands or raw materials, filter results by proximity and category, and explore detailed profiles of local producers. Our platform is designed for accessibility and mobile-friendly use, making it easy to find exactly what you need.',
                'Αναζητήστε brands ή πρώτες ύλες, φιλτράρετε βάσει προσέγγισης και κατηγορίας, και εξερευνήστε λεπτομερή προφίλ τοπικών παραγωγών. Η πλατφόρμα μας είναι σχεδιασμένη για εύκολη χρήση σε κινητά.'
              )}
            </p>
          </section>

          {/* Community & Impact */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('Community & Impact', 'Κοινότητα & Αντίκτυπο')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              {t(
                'By using The Local Hub, you support local businesses and contribute to a more sustainable future. Every purchase from a local producer strengthens communities and reduces the environmental impact of long-distance food transport.',
                'Χρησιμοποιώντας το Local Hub, υποστηρίζετε τοπικές επιχειρήσεις και συμβάλλετε σε ένα βιώσιμο μέλλον. Κάθε αγορά από τοπικό παραγωγό ενισχύει τις κοινότητες και μειώνει το περιβαλλοντικό αποτύπωμα.'
              )}
            </p>
          </section>

          {/* Contact & Feedback */}
          <section className="glass rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('Contact & Feedback', 'Επικοινωνία & Σχόλια')}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-justify leading-relaxed">
              {t('We value your feedback! Reach out with suggestions or questions at', 'Εκτιμούμε τα σχόλιά σας! Επικοινωνήστε μαζί μας στο')}{' '}
              <a href="mailto:hello@thelocalhub.com" className="text-amber-600 dark:text-amber-400 hover:underline">hello@thelocalhub.com</a>.
              {' '}{t('Your input helps us improve and better serve the community.', 'Η γνώμη σας μας βοηθάει να βελτιωνόμαστε και να εξυπηρετούμε καλύτερα την κοινότητα.')}
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
