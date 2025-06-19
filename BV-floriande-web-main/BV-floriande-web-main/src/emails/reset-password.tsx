/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr
} from '@react-email/components';

interface ResetPasswordEmailProps {
  resetLink: string;
  userName?: string;
}

export default function ResetPasswordEmail({ 
  resetLink, 
  userName = 'User' 
}: ResetPasswordEmailProps) {
  const containerStyle = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
  };

  const sectionStyle = {
    padding: '24px',
    border: 'solid 1px #dedede',
    borderRadius: '5px',
    textAlign: 'center' as const,
  };

  const headingStyle = {
    fontSize: '32px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#484848',
  };

  const paragraphStyle = {
    fontSize: '18px',
    lineHeight: '1.4',
    color: '#484848',
  };

  const buttonStyle = {
    backgroundColor: '#5469d4',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '10px',
  };

  const linkStyle = {
    fontSize: '14px',
    color: '#b4becc',
  };

  const hrStyle = {
    borderColor: '#dfe1e4',
    margin: '42px 0 26px',
  };

  const footerStyle = {
    color: '#b4becc',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '50px',
  };

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif' }}>
        <Container style={containerStyle}>
          <Section style={sectionStyle}>
            <Text style={headingStyle}>Reset Your Password</Text>
            <Text style={paragraphStyle}>
              Hello {userName},
            </Text>
            <Text style={paragraphStyle}>
              We received a request to reset your password for your BV Floriande account.
              Click the button below to create a new password.
            </Text>
            <Button style={buttonStyle} href={resetLink}>
              Reset Password
            </Button>
            <Text style={linkStyle}>
              Or copy and paste this URL into your browser:{' '}
              <Link href={resetLink} style={linkStyle}>
                {resetLink}
              </Link>
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              If you didn't request this password reset, you can safely ignore this email.
              Your password will not be changed.
            </Text>
          </Section>
          <Text style={footerStyle}>
            This email was sent by BV Floriande Training Management System.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
