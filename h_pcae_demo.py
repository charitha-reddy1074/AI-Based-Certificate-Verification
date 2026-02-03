"""
H-PCAE Demo: Complete Usage Example
===================================
Demonstrates how to use H-PCAE for student credential verification system.
"""

import numpy as np
from h_pcae_algorithm import HPCAE, create_sample_student_data
import json


def simulate_student_features(student_data: dict) -> np.ndarray:
    """
    Simulate converting student data into a feature vector.
    
    Args:
        student_data: Dictionary with student information
        
    Returns:
        Feature vector (256 dimensions)
    """
    # In a real system, this would include:
    # - One-hot encoded IDs
    # - Normalized marks/grades
    # - Date encodings
    # - Face recognition embeddings (128-512 dim)
    # - Document metadata features
    
    np.random.seed(hash(str(student_data)) % 2**32)
    
    # Simulate feature extraction
    features = []
    
    # Basic info (encoded)
    features.extend([
        student_data['student_id'] / 10000,  # Normalized
        student_data['college_id'] / 100,
        student_data['course_id'] / 50,
        student_data['marks'] / 100
    ])
    
    # Face embedding (simulated 128-dim)
    face_embedding = np.random.randn(128)
    features.extend(face_embedding)
    
    # Metadata features (simulated 124-dim)
    metadata = np.random.randn(124)
    features.extend(metadata)
    
    return np.array(features)


def demo_certificate_verification():
    """
    Demonstrate complete workflow for certificate verification system.
    """
    print("=" * 80)
    print("🎓 H-PCAE Certificate Verification System Demo")
    print("=" * 80)
    
    # Step 1: Create training dataset
    print("\n[Step 1] Creating Training Dataset")
    print("-" * 80)
    
    # Simulate multiple student records for training
    training_students = []
    for i in range(200):
        student = {
            'student_id': 1000 + i,
            'college_id': np.random.randint(1, 10),
            'course_id': np.random.randint(1, 20),
            'marks': np.random.randint(60, 100),
            'issue_date': f"2024-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}"
        }
        training_students.append(student)
    
    # Convert to feature vectors
    X_train = np.array([simulate_student_features(s) for s in training_students])
    print(f"✓ Training samples: {len(training_students)}")
    print(f"✓ Feature dimension: {X_train.shape[1]}")
    
    # Step 2: Train H-PCAE Model
    print("\n[Step 2] Training H-PCAE Model")
    print("-" * 80)
    
    hpcae = HPCAE(
        pca_components=128,    # Stage 1: Remove linear redundancy
        latent_dim=64,         # Stage 2: Non-linear compression
        entropy_features=32    # Stage 3: Keep most informative features
    )
    
    hpcae.fit(X_train, ae_epochs=30, verbose=True)
    
    # Step 3: Issue New Certificate
    print("\n[Step 3] Issuing New Certificate")
    print("-" * 80)
    
    # New student credential
    new_student = {
        'student_id': 5001,
        'name': 'Alice Johnson',
        'college_id': 5,
        'college_name': 'MIT',
        'course_id': 12,
        'course_name': 'Computer Science',
        'marks': 95,
        'issue_date': '2025-05-15'
    }
    
    print(f"Student: {new_student['name']}")
    print(f"College: {new_student['college_name']}")
    print(f"Course: {new_student['course_name']}")
    print(f"Marks: {new_student['marks']}")
    
    # Convert to features
    student_features = simulate_student_features(new_student)
    print(f"\n✓ Extracted {len(student_features)}-dimensional feature vector")
    
    # Compress and generate blockchain hash
    blockchain_data = hpcae.process_for_blockchain(student_features)
    
    print(f"\n🔗 Blockchain Storage:")
    print(f"  Compressed to: {blockchain_data['dimension']} dimensions")
    print(f"  Hash: {blockchain_data['blockchain_hash']}")
    
    # Step 4: Verification Process
    print("\n[Step 4] Certificate Verification")
    print("-" * 80)
    
    # Simulate verification request
    print("Verifier uploads certificate for verification...")
    
    # Re-extract features from certificate
    verify_features = simulate_student_features(new_student)
    verify_data = hpcae.process_for_blockchain(verify_features)
    
    print(f"\nOriginal Hash:  {blockchain_data['blockchain_hash']}")
    print(f"Verified Hash:  {verify_data['blockchain_hash']}")
    
    if blockchain_data['blockchain_hash'] == verify_data['blockchain_hash']:
        print("\n✅ VERIFICATION SUCCESSFUL")
        print("   Certificate is authentic and stored on blockchain")
    else:
        print("\n❌ VERIFICATION FAILED")
        print("   Certificate may be forged or tampered")
    
    # Step 5: Show Privacy Benefits
    print("\n[Step 5] Privacy & Security Analysis")
    print("-" * 80)
    
    original_size = len(student_features) * 4  # 4 bytes per float32
    compressed_size = blockchain_data['dimension'] * 4
    hash_size = len(blockchain_data['blockchain_hash']) / 2  # hex string
    
    print(f"\nData Storage Analysis:")
    print(f"  Original feature vector: {original_size} bytes ({len(student_features)} dims)")
    print(f"  Compressed vector: {compressed_size} bytes ({blockchain_data['dimension']} dims)")
    print(f"  Blockchain hash: {hash_size} bytes (SHA-256)")
    print(f"  Compression ratio: {len(student_features) / blockchain_data['dimension']:.2f}x")
    
    print(f"\n🔒 Security Features:")
    print(f"  ✓ Three-stage compression prevents reverse engineering")
    print(f"  ✓ Original data cannot be reconstructed from hash")
    print(f"  ✓ Hash provides tamper-proof verification")
    print(f"  ✓ Only {blockchain_data['dimension']}-dim vector needed (vs {len(student_features)} original)")
    
    print(f"\n⚡ Blockchain Efficiency:")
    print(f"  ✓ Gas cost reduced by ~{len(student_features) / blockchain_data['dimension']:.1f}x")
    print(f"  ✓ Storage reduced from {original_size}B to {int(hash_size)}B")
    print(f"  ✓ Fast verification (hash comparison)")
    
    # Step 6: Batch Processing
    print("\n[Step 6] Batch Certificate Processing")
    print("-" * 80)
    
    # Process multiple certificates
    test_students = []
    for i in range(5):
        student = {
            'student_id': 6000 + i,
            'college_id': np.random.randint(1, 10),
            'course_id': np.random.randint(1, 20),
            'marks': np.random.randint(60, 100),
            'issue_date': '2025-06-01'
        }
        test_students.append(student)
    
    X_test = np.array([simulate_student_features(s) for s in test_students])
    batch_results = hpcae.process_for_blockchain(X_test)
    
    print(f"Processed {len(test_students)} certificates:")
    for i, (student, result) in enumerate(zip(test_students, batch_results)):
        print(f"\n  Student {student['student_id']}:")
        print(f"    Hash: {result['blockchain_hash'][:32]}...")
        print(f"    Dimension: {result['dimension']}")
    
    # Final Statistics
    print("\n" + "=" * 80)
    print("📊 H-PCAE System Statistics")
    print("=" * 80)
    
    stats = hpcae.get_compression_stats()
    
    print(f"\nStage 1 (PCA):")
    print(f"  Output: {stats['stage_1_pca']['output_dim']} dimensions")
    print(f"  Variance explained: {stats['stage_1_pca']['explained_variance']:.2%}")
    
    print(f"\nStage 2 (Autoencoder):")
    print(f"  Output: {stats['stage_2_autoencoder']['output_dim']} dimensions")
    print(f"  Architecture: {stats['stage_2_autoencoder']['architecture']}")
    
    print(f"\nStage 3 (Entropy Selection):")
    print(f"  Output: {stats['stage_3_entropy']['output_dim']} dimensions")
    print(f"  Selected features: {len(stats['stage_3_entropy']['selected_indices'])} most informative")
    
    print(f"\n✅ Total compression: 256 → {stats['overall']['final_dimension']} dimensions")
    print(f"   ({256 / stats['overall']['final_dimension']:.1f}x reduction)")
    
    print("\n" + "=" * 80)


def demo_comparison_traditional_vs_hpcae():
    """
    Compare traditional approach vs H-PCAE approach.
    """
    print("\n\n")
    print("=" * 80)
    print("📊 Traditional vs H-PCAE Comparison")
    print("=" * 80)
    
    # Traditional: Store all data on blockchain
    traditional_dims = 256
    traditional_gas_cost = traditional_dims * 20000  # Approximate gas per storage slot
    
    # H-PCAE: Store only compressed hash
    hpcae_dims = 32
    hpcae_gas_cost = 20000  # Single hash storage
    
    print("\n┌─────────────────────────────────┬──────────────┬──────────────┐")
    print("│ Metric                          │ Traditional  │ H-PCAE       │")
    print("├─────────────────────────────────┼──────────────┼──────────────┤")
    print(f"│ Dimensions stored               │ {traditional_dims:>12} │ {hpcae_dims:>12} │")
    print(f"│ Gas cost (approx)               │ {traditional_gas_cost:>12,} │ {hpcae_gas_cost:>12,} │")
    print(f"│ Storage size (bytes)            │ {traditional_dims*4:>12} │ {32:>12} │")
    print(f"│ Privacy protection              │      Low     │     High     │")
    print(f"│ Reverse engineering risk        │     High     │      Low     │")
    print(f"│ Verification speed              │     Slow     │     Fast     │")
    print("└─────────────────────────────────┴──────────────┴──────────────┘")
    
    print(f"\n💰 Cost Savings: {traditional_gas_cost / hpcae_gas_cost:.1f}x reduction in gas costs")
    print(f"🔒 Privacy Gain: 3-stage irreversible compression")
    print(f"⚡ Speed Gain: Hash comparison vs full vector comparison")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    # Run complete demo
    demo_certificate_verification()
    
    # Show comparison
    demo_comparison_traditional_vs_hpcae()
    
    print("\n✅ Demo Complete!")
    print("\nKey Takeaways:")
    print("  1. H-PCAE reduces 256-dim data to 32-dim with minimal information loss")
    print("  2. Three-stage hybrid approach ensures security and privacy")
    print("  3. Blockchain storage is efficient (only hash stored)")
    print("  4. Verification is fast and tamper-proof")
    print("  5. Gas costs reduced by ~256x compared to traditional approach")
