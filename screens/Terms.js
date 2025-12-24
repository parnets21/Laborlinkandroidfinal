import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';

const Terms = () => {
  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleUrlPress = (url) => {
    Linking.openURL(url);
  };

  const LinkText = ({ children, onPress, style }) => (
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.link, style]}>{children}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>TERMS AND CONDITIONS</Text>

        <Text style={styles.lastUpdated}>Last updated: 2025-06-13</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.bold}>Labor Link</Text> ("Company", "we", "our", "us")!
          </Text>
          <Text style={styles.paragraph}>
            These Terms of Service ("Terms", "Terms of Service") govern your use of our website located at{' '}
            <LinkText onPress={() => handleUrlPress('https://laborlink.co.in')}>
            </LinkText>{' '}
            (together or individually "Service") operated by <Text style={styles.bold}>Labor Link</Text>.
          </Text>
          <Text style={styles.paragraph}>
            Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages.
          </Text>
          <Text style={styles.paragraph}>
            Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound of them.
          </Text>
          <Text style={styles.paragraph}>
            If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>{' '}
            so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Communications</Text>
          <Text style={styles.paragraph}>
            By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Contests, Sweepstakes and Promotions</Text>
          <Text style={styles.paragraph}>
            Any contests, sweepstakes or other promotions (collectively, "Promotions") made available through Service may be governed by rules that are separate from these Terms of Service. If you participate in any Promotions, please review the applicable rules as well as our Privacy Policy. If the rules for a Promotion conflict with these Terms of Service, Promotion rules will apply.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Content</Text>
          <Text style={styles.paragraph}>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for Content that you post on or through Service, including its legality, reliability, and appropriateness.
          </Text>
          <Text style={styles.paragraph}>
            By posting Content on or through Service, You represent and warrant that: (i) Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.
          </Text>
          <Text style={styles.paragraph}>
            You retain any and all of your rights to any Content you submit, post or display on or through Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third party posts on or through Service. However, by posting Content using Service you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through Service. You agree that this license includes the right for us to make your Content available to other users of Service, who may also use your Content subject to these Terms.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Labor Link</Text> has the right but not the obligation to monitor and edit all Content provided by users.
          </Text>
          <Text style={styles.paragraph}>
            In addition, Content found on or through this Service are the property of <Text style={styles.bold}>Labor Link</Text> or used with permission. You may not distribute, modify, transmit, reuse, download, repost, copy, or use said Content, whether in whole or in part, for commercial purposes or for personal gain, without express advance written permission from us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
          <Text style={styles.paragraph}>
            You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
          </Text>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• In any way that violates any applicable national or international law or regulation.</Text>
            <Text style={styles.bulletPoint}>• For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</Text>
            <Text style={styles.bulletPoint}>• To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</Text>
            <Text style={styles.bulletPoint}>• To impersonate or attempt to impersonate Company, a Company employee, another user, or any other person or entity.</Text>
            <Text style={styles.bulletPoint}>• In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</Text>
            <Text style={styles.bulletPoint}>• To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of Service, or which, as determined by us, may harm or offend Company or users of Service or expose them to liability.</Text>
          </View>
          <Text style={styles.paragraph}>Additionally, you agree not to:</Text>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• Use Service in any manner that could disable, overburden, damage, or impair Service or interfere with any other party's use of Service, including their ability to engage in real time activities through Service.</Text>
            <Text style={styles.bulletPoint}>• Use any robot, spider, or other automatic device, process, or means to access Service for any purpose, including monitoring or copying any of the material on Service.</Text>
            <Text style={styles.bulletPoint}>• Use any manual process to monitor or copy any of the material on Service or for any other unauthorized purpose without our prior written consent.</Text>
            <Text style={styles.bulletPoint}>• Use any device, software, or routine that interferes with the proper working of Service.</Text>
            <Text style={styles.bulletPoint}>• Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of Service, the server on which Service is stored, or any server, computer, or database connected to Service.</Text>
            <Text style={styles.bulletPoint}>• Attack Service via a denial-of-service attack or a distributed denial-of-service attack.</Text>
            <Text style={styles.bulletPoint}>• Take any action that may damage or falsify Company rating.</Text>
            <Text style={styles.bulletPoint}>• Otherwise attempt to interfere with the proper working of Service.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Analytics</Text>
          <Text style={styles.paragraph}>
            We may use third-party Service Providers to monitor and analyze the use of our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. No Use By Minors</Text>
          <Text style={styles.paragraph}>
            Service is intended only for access and use by individuals at least eighteen (18) years old. By accessing or using Service, you warrant and represent that you are at least eighteen (18) years of age and with the full authority, right, and capacity to enter into this agreement and abide by all of the terms and conditions of Terms. If you are not at least eighteen (18) years old, you are prohibited from both the access and usage of Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on Service.
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </Text>
          <Text style={styles.paragraph}>
            You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you, without appropriate authorization. You may not use as a username any name that is offensive, vulgar or obscene.
          </Text>
          <Text style={styles.paragraph}>
            We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in our sole discretion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of <Text style={styles.bold}>Labor Link</Text> and its licensors. Service is protected by copyright, trademark, and other laws of and foreign countries. Our trademarks may not be used in connection with any product or service without the prior written consent of <Text style={styles.bold}>Labor Link</Text>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Copyright Policy</Text>
          <Text style={styles.paragraph}>
            We respect the intellectual property rights of others. It is our policy to respond to any claim that Content posted on Service infringes on the copyright or other intellectual property rights ("Infringement") of any person or entity.
          </Text>
          <Text style={styles.paragraph}>
            If you are a copyright owner, or authorized on behalf of one, and you believe that the copyrighted work has been copied in a way that constitutes copyright infringement, please submit your claim via email to{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>, with the subject line: "Copyright Infringement" and include in your claim a detailed description of the alleged Infringement as detailed below, under "DMCA Notice and Procedure for Copyright Infringement Claims"
          </Text>
          <Text style={styles.paragraph}>
            You may be held accountable for damages (including costs and attorneys' fees) for misrepresentation or bad-faith claims on the infringement of any Content found on and/or through Service on your copyright.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. DMCA Notice and Procedure for Copyright Infringement Claims</Text>
          <Text style={styles.paragraph}>
            You may submit a notification pursuant to the Digital Millennium Copyright Act (DMCA) by providing our Copyright Agent with the following information in writing (see 17 U.S.C 512(c)(3) for further detail):
          </Text>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>• An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright's interest;</Text>
            <Text style={styles.bulletPoint}>• A description of the copyrighted work that you claim has been infringed, including the URL (i.e., web page address) of the location where the copyrighted work exists or a copy of the copyrighted work;</Text>
            <Text style={styles.bulletPoint}>• Identification of the URL or other specific location on Service where the material that you claim is infringing is located;</Text>
            <Text style={styles.bulletPoint}>• Your address, telephone number, and email address;</Text>
            <Text style={styles.bulletPoint}>• A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;</Text>
            <Text style={styles.bulletPoint}>• A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</Text>
          </View>
          <Text style={styles.paragraph}>
            You can contact our Copyright Agent via email at{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Error Reporting and Feedback</Text>
          <Text style={styles.paragraph}>
            You may provide us either directly at{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>{' '}
            or via third party sites and tools with information and feedback concerning errors, suggestions for improvements, ideas, problems, complaints, and other matters related to our Service ("Feedback"). You acknowledge and agree that: (i) you shall not retain, acquire or assert any intellectual property right or other right, title or interest in or to the Feedback; (ii) Company may have development ideas similar to the Feedback; (iii) Feedback does not contain confidential information or proprietary information from you or any third party; and (iv) Company is not under any obligation of confidentiality with respect to the Feedback. In the event the transfer of the ownership to the Feedback is not possible due to applicable mandatory laws, you grant Company and its affiliates an exclusive, transferable, irrevocable, free-of-charge, sub-licensable, unlimited and perpetual right to use (including copy, modify, create derivative works, publish, distribute and commercialize) Feedback in any manner and for any purpose.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Links To Other Web Sites</Text>
          <Text style={styles.paragraph}>
            Our Service may contain links to third party web sites or services that are not owned or controlled by <Text style={styles.bold}>Labor Link</Text>.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Labor Link</Text> has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third party web sites or services. We do not warrant the offerings of any of these entities/individuals or their websites.
          </Text>
          <Text style={styles.paragraph}>
            For example, the outlined{' '}
            <LinkText onPress={() => handleUrlPress('https://laborlink.co.in/Terms')}>
              Terms of Use
            </LinkText>{' '}
            have been created using{' '}
            <LinkText onPress={() => handleUrlPress('https://laborlink.co.in')}>
              laborlink.co.in
            </LinkText>, a free web application for generating high-quality legal documents. LaborLink's{' '}
            <LinkText onPress={() => handleUrlPress('https://laborlink.co.in')}>
              Terms and Conditions generator
            </LinkText>{' '}
            is an easy-to-use free tool for creating an excellent standard Terms of Service template for a website, blog, e-commerce store or app.
          </Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            You acknowledge and agree that Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such third party web sites or services.
          </Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            We strongly advise you to read the terms of service and privacy policies of any third party web sites or services that you visit.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Disclaimer Of Warranty</Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            These services are provided by Company on an "as is" and "as available" basis. Company makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content or materials included therein. You expressly agree that your use of these services, their content, and any services or items obtained from us is at your sole risk.
          </Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            Neither Company nor any person associated with Company makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the services. Without limiting the foregoing, neither Company nor anyone associated with Company represents or warrants that the services, their content, or any services or items obtained through the services will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that the services or the server that makes it available are free of viruses or other harmful components or that the services or any services or items obtained through the services will otherwise meet your needs or expectations.
          </Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            Company hereby disclaims all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for particular purpose.
          </Text>
          <Text style={styles.paragraph}>
            The foregoing does not affect any warranties which cannot be excluded or limited under applicable law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Limitation Of Liability</Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            Except as prohibited by law, you will hold us and our officers, directors, employees, and agents harmless for any indirect, punitive, special, incidental, or consequential damage, however it arises (including attorneys' fees and all related costs and expenses of litigation and arbitration, or at trial or on appeal, if any, whether or not litigation or arbitration is instituted), whether in an action of contract, negligence, or other tortious action, or arising out of or in connection with this agreement, including without limitation any claim for personal injury or property damage, arising from this agreement and any violation by you of any federal, state, or local laws, statutes, rules, or regulations, even if Company has been previously advised of the possibility of such damage. Except as prohibited by law, if there is liability found on the part of Company, it will be limited to the amount paid for the products and/or services, and under no circumstances will there be consequential or punitive damages. Some states do not allow the exclusion or limitation of punitive, incidental or consequential damages, so the prior limitation or exclusion may not apply to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and bar access to Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of Terms.
          </Text>
          <Text style={styles.paragraph}>
            If you wish to terminate your account, you may simply discontinue using Service.
          </Text>
          <Text style={styles.paragraph}>
            All provisions of Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>17. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of India, which governing law applies to agreement without regard to its conflict of law provisions.
          </Text>
          <Text style={styles.paragraph}>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have had between us regarding Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>18. Changes To Service</Text>
          <Text style={styles.paragraph}>
            We reserve the right to withdraw or amend our Service, and any service or material we provide via Service, in our sole discretion without notice. We will not be liable if for any reason all or any part of Service is unavailable at any time or for any period. From time to time, we may restrict access to some parts of Service, or the entire Service, to users, including registered users.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>19. Amendments To Terms</Text>
          <Text style={styles.paragraph}>
            We may amend Terms at any time by posting the amended terms on this site. It is your responsibility to review these Terms periodically.
          </Text>
          <Text style={styles.paragraph}>
            Your continued use of the Platform following the posting of revised Terms means that you accept and agree to the changes. You are expected to check this page frequently so you are aware of any changes, as they are binding on you.
          </Text>
          <Text style={styles.paragraph}>
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>20. Waiver And Severability</Text>
          <Text style={styles.paragraph}>
            No waiver by Company of any term or condition set forth in Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of Company to assert a right or provision under Terms shall not constitute a waiver of such right or provision.
          </Text>
          <Text style={styles.paragraph}>
            If any provision of Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of Terms will continue in full force and effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>21. Acknowledgement</Text>
          <Text style={[styles.paragraph, styles.uppercase, styles.bold]}>
            By using Service or other services provided by us, you acknowledge that you have read these terms of service and agree to be bound by them.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>22. Contact Us</Text>
          <Text style={styles.paragraph}>
            Please send your feedback, comments, requests for technical support by email:{' '}
            <LinkText onPress={() => handleEmailPress('labourlink2025@gmail.com')}>
              labourlink2025@gmail.com
            </LinkText>.
          </Text>
        </View>

        <Text style={styles.footer}>
          These{' '}
          <LinkText onPress={() => handleUrlPress('https://laborlink.co.in/Terms')}>
            Terms of Service
          </LinkText>{' '}
          were created for{' '}
          <LinkText onPress={() => handleUrlPress('https://laborlink.co.in')}>
            https://laborlink.co.in
          </LinkText>{' '}
          by{' '}
          <LinkText onPress={() => handleUrlPress('https://laborlink.co.in')}>
            laborlink.co.in
          </LinkText>{' '}
          on 2025-06-13.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 48,
    maxWidth: 768,
    alignSelf: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 24,
  },
  lastUpdated: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  paragraph: {
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
    fontSize: 16,
  },
  bold: {
    fontWeight: '600',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  bulletContainer: {
    marginBottom: 16,
  },
  bulletPoint: {
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 8,
    fontSize: 16,
  },
  footer: {
    marginTop: 0,
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
});

export default Terms;