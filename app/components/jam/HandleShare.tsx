"use client";

import { useState } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

export const QRCodeShare = ({ jamId }: { jamId: string }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (qrCodeDataUrl) {
      setShowQR(true);
      return;
    }

    setIsGenerating(true);
    try {
      const shareUrl = `${window.location.origin}/creator/${jamId}`;
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      setShowQR(true);
      toast.success('QR Code generated!');
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('QR Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUrl = async () => {
    const shareUrl = `${window.location.origin}/creator/${jamId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Jam link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadQR = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `oneamp-jam-${jamId}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    toast.success('QR Code downloaded!');
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateQRCode}
        disabled={isGenerating}
        className="w-full bg-black hover:opacity-85 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M4 4h4.01M4 16h4.01" />
            </svg>
            Share with QR Code
          </>
        )}
      </button>

      {showQR && qrCodeDataUrl && (
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
          <div className="text-center">
            <img
              src={qrCodeDataUrl}
              alt="QR Code for jam"
              className="mx-auto rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-2">
              Scan to join the jam
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyUrl}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={downloadQR}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              Download QR
            </button>
          </div>
          
          <button
            onClick={() => setShowQR(false)}
            className="w-full text-gray-500 hover:text-gray-700 py-1 text-sm transition-colors"
          >
            Hide QR Code
          </button>
        </div>
      )}
    </div>
  );
};

// Keep the original handleShare function for backward compatibility
export const handleShare = async (jamId: string) => {
  const shareUrl = `${window.location.origin}/creator/${jamId}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'OneAmp Jam',
        text: 'Check out this awesome music jam!',
        url: shareUrl,
      });
    } catch (error) {
      console.log('Sharing cancelled or failed: ' + error);
      await copyToClipboard(shareUrl);
    }
  } else {
    await copyToClipboard(shareUrl);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Jam link copied to clipboard!');
  } catch (error) {
    toast.error('Failed to copy to clipboard: '+ error);
    prompt('Copy this link to share:', text);
  }
};