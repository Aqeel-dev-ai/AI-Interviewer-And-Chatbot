
export const EMAILJS_CONFIG = {
    
    serviceId: 'service_ne2uq1a',  
    templateId: 'template_q8002fi',  
    publicKey: 'MxtQONEPYHq_rbx3E',  
};

// Initialize EmailJS
import emailjs from '@emailjs/browser';

const validateConfig = () => {
    if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.serviceId.startsWith('service_')) {
        console.error('Invalid EmailJS Service ID format. Should start with "service_"');
    }
    if (!EMAILJS_CONFIG.templateId || !EMAILJS_CONFIG.templateId.startsWith('template_')) {
        console.error('Invalid EmailJS Template ID format. Should start with "template_"');
    }
    if (!EMAILJS_CONFIG.publicKey || EMAILJS_CONFIG.publicKey.length < 24) {
        console.error('EmailJS Public Key seems too short. Please verify.');
    }
};

// Initialize only if we're in a browser environment
if (typeof window !== 'undefined') {
    validateConfig();
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    // Test the configuration
    console.log('EmailJS Configuration:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        publicKeyLength: EMAILJS_CONFIG.publicKey.length
    });
} 