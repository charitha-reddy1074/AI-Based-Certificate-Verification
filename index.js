// Redirect to the actual application entry point
import('./CertChain-main/dist/index.cjs').catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
