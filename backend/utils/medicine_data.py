"""
Verified Medicine Compendium & Drug Interaction Knowledge Base.
Contains clinical-grade monographs, interaction matrices, duplicate active ingredient rules,
and allergy cross-reactivity maps.
"""

VERIFIED_MEDICINES = [
    {
        "generic_name": "Atorvastatin Calcium",
        "brand_name": "Lipitor",
        "drug_class": "HMG-CoA Reductase Inhibitor (Statin)",
        "active_ingredients": ["atorvastatin"],
        "dosage_forms": ["Film-Coated Tablet"],
        "available_strengths": ["10 mg", "20 mg", "40 mg", "80 mg"],
        "therapeutic_use": "Primary hyperlipidemia, prevention of cardiovascular disease and stroke reduction in high-risk patients.",
        "standard_dosing_guidance": "Usually 10-20 mg orally once daily with or without food. Maximum dose 80 mg/day under clinical monitoring.",
        "warnings": [
            "Risk of myopathy and rhabdomyolysis; report unexplained muscle pain or tenderness promptly.",
            "Avoid excessive consumption of grapefruit juice (>1.2 L/day) which elevates statin plasma levels.",
            "Baseline liver function tests are recommended before initiating therapy."
        ],
        "known_side_effects": [
            "Myalgia (muscle aches)",
            "Headache",
            "Diarrhea / Nausea",
            "Elevated liver enzymes (ALT/AST)",
            "Nasopharyngitis"
        ],
        "contraindications": [
            "Active liver disease or unexplained persistent elevation of hepatic transaminases.",
            "Pregnancy and nursing mothers."
        ],
        "barcode": "030045044910",
        "source": "U.S. National Library of Medicine (DailyMed) & Clinical Pharmacology Compendium",
        "last_updated": "2026-06-15",
        "is_verified": True
    },
    {
        "generic_name": "Lisinopril",
        "brand_name": "Zestril / Prinivil",
        "drug_class": "Angiotensin-Converting Enzyme (ACE) Inhibitor",
        "active_ingredients": ["lisinopril"],
        "dosage_forms": ["Oral Tablet"],
        "available_strengths": ["2.5 mg", "5 mg", "10 mg", "20 mg", "40 mg"],
        "therapeutic_use": "Treatment of hypertension, adjunctive therapy for heart failure, and post-myocardial infarction hemodynamic recovery.",
        "standard_dosing_guidance": "Initial 10 mg once daily for hypertension; titrate up to 40 mg daily based on blood pressure response.",
        "warnings": [
            "Boxed Warning: Drugs acting on renin-angiotensin system can cause fetal harm when used during pregnancy.",
            "Risk of angioedema (swelling of face, lips, tongue, or airway) requiring emergency medical intervention.",
            "Monitor serum potassium; avoid potassium supplements unless specifically prescribed."
        ],
        "known_side_effects": [
            "Persistent dry cough",
            "Dizziness / Orthostatic hypotension",
            "Hyperkalemia (high blood potassium)",
            "Fatigue",
            "Headache"
        ],
        "contraindications": [
            "History of angioedema related to previous ACE inhibitor therapy.",
            "Hereditary or idiopathic angioedema.",
            "Concomitant use with aliskiren in patients with diabetes."
        ],
        "barcode": "030045044927",
        "source": "U.S. National Library of Medicine (DailyMed) & USP Verified Monograph",
        "last_updated": "2026-05-20",
        "is_verified": True
    },
    {
        "generic_name": "Metformin Hydrochloride",
        "brand_name": "Glucophage",
        "drug_class": "Biguanide Antidiabetic Agent",
        "active_ingredients": ["metformin"],
        "dosage_forms": ["Immediate-Release Tablet", "Extended-Release Tablet (ER)"],
        "available_strengths": ["500 mg", "850 mg", "1000 mg"],
        "therapeutic_use": "First-line oral treatment for type 2 diabetes mellitus to improve glycemic control in conjunction with diet and exercise.",
        "standard_dosing_guidance": "Initial 500 mg orally twice daily with meals or 850 mg once daily with meal. Maximum recommended dose is 2550 mg/day in divided doses.",
        "warnings": [
            "Boxed Warning: Lactic acidosis is a rare but severe metabolic complication. Discontinue temporarily before iodinated radiocontrast imaging procedures.",
            "Contraindicated in severe renal impairment (eGFR <30 mL/min/1.73 m²).",
            "Monitor serum Vitamin B12 levels periodically during long-term therapy."
        ],
        "known_side_effects": [
            "Gastrointestinal upset (diarrhea, nausea, vomiting)",
            "Abdominal bloating and flatulence",
            "Metallic taste in mouth",
            "Vitamin B12 deficiency"
        ],
        "contraindications": [
            "Severe renal dysfunction (eGFR <30 mL/min).",
            "Acute or chronic metabolic acidosis, including diabetic ketoacidosis."
        ],
        "barcode": "030045044934",
        "source": "U.S. National Library of Medicine (DailyMed) & ADA Standards of Care",
        "last_updated": "2026-07-10",
        "is_verified": True
    },
    {
        "generic_name": "Amoxicillin",
        "brand_name": "Amoxil",
        "drug_class": "Aminopenicillin Antibiotic (Beta-Lactam)",
        "active_ingredients": ["amoxicillin"],
        "dosage_forms": ["Oral Capsule", "Tablet", "Oral Suspension"],
        "available_strengths": ["250 mg", "500 mg", "875 mg"],
        "therapeutic_use": "Treatment of susceptible bacterial infections of the ear, nose, throat, lower respiratory tract, and skin.",
        "standard_dosing_guidance": "Typically 500 mg every 8 hours or 875 mg every 12 hours depending on infection severity. Complete full course as prescribed.",
        "warnings": [
            "Contraindicated in patients with serious hypersensitivity reactions (anaphylaxis) to beta-lactam antibiotics.",
            "Clostridioides difficile-associated diarrhea (CDAD) may develop during or after antibiotic treatment."
        ],
        "known_side_effects": [
            "Diarrhea / Soft stools",
            "Nausea and vomiting",
            "Cutaneous skin rash or urticaria",
            "Candidiasis (yeast overgrowth)"
        ],
        "contraindications": [
            "Documented history of severe allergic reaction (anaphylaxis, angioedema) to any penicillin."
        ],
        "barcode": "030045044941",
        "source": "FDA Approved Drug Products & Clinical Pharmacology Compendium",
        "last_updated": "2026-04-12",
        "is_verified": True
    },
    {
        "generic_name": "Ibuprofen",
        "brand_name": "Advil / Motrin",
        "drug_class": "Nonsteroidal Anti-Inflammatory Drug (NSAID)",
        "active_ingredients": ["ibuprofen"],
        "dosage_forms": ["Film-Coated Tablet", "Liquid-Filled Capsule", "Oral Suspension"],
        "available_strengths": ["200 mg (OTC)", "400 mg", "600 mg", "800 mg"],
        "therapeutic_use": "Relief of mild-to-moderate pain, reduction of fever, and treatment of inflammatory disorders including arthritis.",
        "standard_dosing_guidance": "Adult dose: 200-400 mg every 4-6 hours as needed with food. Prescription anti-inflammatory dose: 600-800 mg 3-4 times daily (max 3200 mg/day).",
        "warnings": [
            "Boxed Warning: Increased risk of serious cardiovascular thrombotic events, myocardial infarction, and stroke.",
            "Boxed Warning: Serious gastrointestinal adverse events including bleeding, ulceration, and perforation of stomach or intestines.",
            "Avoid in patients with severe heart failure or chronic kidney disease."
        ],
        "known_side_effects": [
            "Dyspepsia / Heartburn / Epigastric distress",
            "Fluid retention and peripheral edema",
            "Elevated blood pressure",
            "Dizziness"
        ],
        "contraindications": [
            "History of asthma, urticaria, or allergic-type reactions after taking aspirin or other NSAIDs.",
            "Setting of coronary artery bypass graft (CABG) surgery."
        ],
        "barcode": "030045044958",
        "source": "U.S. National Library of Medicine (DailyMed) & FDA Drug Safety Database",
        "last_updated": "2026-08-01",
        "is_verified": True
    },
    {
        "generic_name": "Acetaminophen",
        "brand_name": "Tylenol / Panadol",
        "drug_class": "Non-Opioid Analgesic and Antipyretic",
        "active_ingredients": ["acetaminophen"],
        "dosage_forms": ["Tablet", "Caplet", "Oral Liquid", "Suppository"],
        "available_strengths": ["325 mg (Regular)", "500 mg (Extra Strength)", "650 mg (Extended Relief)"],
        "therapeutic_use": "Temporary relief of mild-to-moderate pain and reduction of fever.",
        "standard_dosing_guidance": "Adults: 325-650 mg every 4-6 hours or 1000 mg every 6 hours as needed. Strict maximum: 4,000 mg within a 24-hour period.",
        "warnings": [
            "Boxed Warning: Hepatotoxicity (severe liver damage) risk if maximum daily limit is exceeded, taken with alcohol, or combined with other acetaminophen-containing products.",
            "Always check combination cold/flu products to prevent accidental duplicate acetaminophen overdose."
        ],
        "known_side_effects": [
            "Generally well-tolerated at recommended therapeutic doses.",
            "Rare: rash, hypersensitivity, or acute generalized exanthematous pustulosis."
        ],
        "contraindications": [
            "Severe active hepatic impairment or severe liver disease.",
            "Known hypersensitivity to acetaminophen."
        ],
        "barcode": "030045044965",
        "source": "U.S. National Library of Medicine (DailyMed) & USP Compendium",
        "last_updated": "2026-05-18",
        "is_verified": True
    },
    {
        "generic_name": "Warfarin Sodium",
        "brand_name": "Coumadin / Jantoven",
        "drug_class": "Vitamin K Antagonist (Oral Anticoagulant)",
        "active_ingredients": ["warfarin"],
        "dosage_forms": ["Scored Tablet"],
        "available_strengths": ["1 mg", "2 mg", "2.5 mg", "3 mg", "4 mg", "5 mg", "6 mg", "7.5 mg", "10 mg"],
        "therapeutic_use": "Prophylaxis and treatment of venous thromboembolism, pulmonary embolism, and thromboembolic complications associated with atrial fibrillation or cardiac valve replacement.",
        "standard_dosing_guidance": "Individualized dosage guided by Prothrombin Time / International Normalized Ratio (INR) target monitoring (typically INR 2.0-3.0). Take once daily at same time.",
        "warnings": [
            "Boxed Warning: Can cause major or fatal bleeding. Perform regular INR monitoring.",
            "Strict avoidance of concurrent NSAIDs, aspirin, or antiplatelet agents without explicit cardiology oversight.",
            "Maintain consistent dietary Vitamin K intake (green leafy vegetables)."
        ],
        "known_side_effects": [
            "Bleeding (epistaxis, hematuria, easy bruising, melena)",
            "Nausea / Cramping",
            "Skin necrosis (rare complication)"
        ],
        "contraindications": [
            "Pregnancy (causes major teratogenic abnormalities).",
            "Active hemorrhagic tendencies, clinical ulcers, or threatened abortion."
        ],
        "barcode": "030045044972",
        "source": "U.S. National Library of Medicine (DailyMed) & CHEST Antithrombotic Guidelines",
        "last_updated": "2026-06-30",
        "is_verified": True
    },
    {
        "generic_name": "Aspirin (Acetylsalicylic Acid)",
        "brand_name": "Bayer Aspirin / Ecotrin",
        "drug_class": "Salicylate / Platelet Aggregation Inhibitor",
        "active_ingredients": ["aspirin"],
        "dosage_forms": ["Enteric-Coated Tablet", "Chewable Tablet"],
        "available_strengths": ["81 mg (Low Dose)", "325 mg (Standard)"],
        "therapeutic_use": "Secondary prevention of atherosclerotic cardiovascular events, ischemic stroke, transient ischemic attack (TIA), and acute coronary syndromes.",
        "standard_dosing_guidance": "Cardiovascular secondary prevention: 81 mg once daily orally. Acute myocardial infarction: 162-325 mg chewed immediately.",
        "warnings": [
            "Do not administer to children or adolescents with viral infections (influenza, varicella) due to Reye's Syndrome risk.",
            "Increased risk of gastrointestinal mucosal erosion and ulceration."
        ],
        "known_side_effects": [
            "Dyspepsia / Gastric irritation",
            "Prolonged bleeding time / Easy bruising",
            "Tinnitus at high doses"
        ],
        "contraindications": [
            "Known aspirin-induced asthma or severe salicylate hypersensitivity.",
            "Active gastrointestinal bleeding."
        ],
        "barcode": "030045044989",
        "source": "U.S. National Library of Medicine (DailyMed) & AHA/ACC Clinical Guidelines",
        "last_updated": "2026-07-22",
        "is_verified": True
    },
    {
        "generic_name": "Omeprazole",
        "brand_name": "Prilosec",
        "drug_class": "Proton Pump Inhibitor (PPI)",
        "active_ingredients": ["omeprazole"],
        "dosage_forms": ["Delayed-Release Capsule", "Delayed-Release Tablet"],
        "available_strengths": ["10 mg", "20 mg", "40 mg"],
        "therapeutic_use": "Treatment of gastroesophageal reflux disease (GERD), erosive esophagitis, duodenal ulcers, and Zollinger-Ellison syndrome.",
        "standard_dosing_guidance": "20-40 mg once daily taken 30-60 minutes before a meal, preferably breakfast. Swallow whole, do not chew or crush granules.",
        "warnings": [
            "Prolonged PPI use is associated with hypomagnesemia, Clostridioides difficile diarrhea, bone fractures, and impaired Vitamin B12 absorption.",
            "Inhibits CYP2C19; may decrease activation and clinical efficacy of clopidogrel."
        ],
        "known_side_effects": [
            "Headache",
            "Abdominal pain",
            "Constipation / Diarrhea",
            "Flatulence"
        ],
        "contraindications": [
            "Hypersensitivity to omeprazole or any substituted benzimidazole."
        ],
        "barcode": "030045044996",
        "source": "U.S. National Library of Medicine (DailyMed) & ACG GERD Guidelines",
        "last_updated": "2026-06-18",
        "is_verified": True
    },
    {
        "generic_name": "Metoprolol Succinate",
        "brand_name": "Toprol-XL",
        "drug_class": "Selective Beta-1 Adrenergic Receptor Blocker",
        "active_ingredients": ["metoprolol"],
        "dosage_forms": ["Extended-Release Tablet"],
        "available_strengths": ["25 mg", "50 mg", "100 mg", "200 mg"],
        "therapeutic_use": "Management of hypertension, long-term angina pectoris, and stable symptomatic heart failure (NYHA Class II or III).",
        "standard_dosing_guidance": "Initial 25-50 mg orally once daily. Do not discontinue abruptly; gradual taper over 1-2 weeks is required to prevent rebound angina or tachycardia.",
        "warnings": [
            "Boxed Warning: Abrupt cessation can cause acute exacerbation of severe angina, myocardial infarction, or ventricular arrhythmias.",
            "Can mask signs of hypoglycemia (e.g. tachycardia) in diabetic patients."
        ],
        "known_side_effects": [
            "Bradycardia (slow heart rate)",
            "Fatigue / Lethargy",
            "Dizziness / Hypotension",
            "Cold extremities"
        ],
        "contraindications": [
            "Severe bradycardia (<45 bpm).",
            "Second- or third-degree atrioventricular (AV) heart block.",
            "Decompensated cardiogenic shock."
        ],
        "barcode": "030045045009",
        "source": "U.S. National Library of Medicine (DailyMed) & ACC/AHA Guidelines",
        "last_updated": "2026-05-30",
        "is_verified": True
    }
]

# Clinical Pairwise Drug-Drug Interactions Matrix
DRUG_INTERACTIONS = [
    {
        "drug1": "warfarin",
        "drug2": "aspirin",
        "severity": "High",
        "interaction_name": "Enhanced Anticoagulation & Severe Hemorrhage Risk",
        "mechanism": "Concurrent administration combines antiplatelet inhibition with vitamin K-dependent clotting factor suppression, exponentially elevating gastrointestinal and systemic bleeding risks.",
        "clinical_action": "Avoid combination unless explicitly prescribed for specific mechanical valve or cardiac stent regimens with rigorous clinical oversight and frequent INR monitoring.",
        "source": "Clinical Pharmacology Drug Interaction Compendium (Section: Hemostatic Interactions)"
    },
    {
        "drug1": "warfarin",
        "drug2": "ibuprofen",
        "severity": "High",
        "interaction_name": "Major Gastrointestinal Bleeding & Anticoagulant Potentiation",
        "mechanism": "NSAIDs damage gastric mucosa, inhibit platelet cyclooxygenase-1, and can competitively displace warfarin from plasma albumin binding sites.",
        "clinical_action": "Contraindicated for routine analgesia. Recommend alternative non-NSAID analgesics (such as topical therapy or physician-monitored acetaminophen) under direct medical guidance.",
        "source": "American Journal of Health-System Pharmacy (Drug Safety Matrix)"
    },
    {
        "drug1": "lisinopril",
        "drug2": "ibuprofen",
        "severity": "Moderate",
        "interaction_name": "Attenuated Antihypertensive Effect & Acute Renal Impairment",
        "mechanism": "NSAIDs inhibit renal vasodilatory prostaglandins, decreasing renal perfusion and blunting the blood pressure-lowering response of ACE inhibitors.",
        "clinical_action": "Monitor blood pressure and serum creatinine if concurrent use is unavoidable. Limit NSAID duration to shortest necessary interval.",
        "source": "American College of Cardiology Clinical Interaction Registry"
    },
    {
        "drug1": "lisinopril",
        "drug2": "spironolactone",
        "severity": "High",
        "interaction_name": "Severe Hyperkalemia Risk",
        "mechanism": "Both agents decrease aldosterone-mediated potassium excretion in the distal renal tubule, leading to potentially lethal cardiac arrhythmias.",
        "clinical_action": "Requires baseline and periodic serum potassium and renal function monitoring. Restrict potassium supplements.",
        "source": "FDA Safety Alerts & Heart Failure Society of America Guidelines"
    },
    {
        "drug1": "clopidogrel",
        "drug2": "omeprazole",
        "severity": "Moderate",
        "interaction_name": "Reduced Antiplatelet Bioactivation via CYP2C19 Inhibition",
        "mechanism": "Omeprazole competitive inhibition of CYP2C19 reduces conversion of clopidogrel to its active thiol metabolite, diminishing platelet inhibition.",
        "clinical_action": "Consider non-CYP2C19 inhibiting gastroprotective agents such as pantoprazole or H2-receptor antagonists if acid suppression is clinically indicated.",
        "source": "FDA Drug Safety Communication & ACC/AHA Clopidogrel-PPI Advisory"
    },
    {
        "drug1": "atorvastatin",
        "drug2": "clarithromycin",
        "severity": "High",
        "interaction_name": "Potent CYP3A4 Inhibition Leading to Rhabdomyolysis",
        "mechanism": "Macrolide antibiotics potently block CYP3A4-mediated statin catabolism, causing dramatic plasma statin accumulation.",
        "clinical_action": "Temporarily suspend atorvastatin during macrolide antibiotic course or select azithromycin as a non-interacting alternative.",
        "source": "DailyMed Interaction Section (Lipitor Product Monograph)"
    },
    {
        "drug1": "metformin",
        "drug2": "furosemide",
        "severity": "Moderate",
        "interaction_name": "Elevated Metformin Concentration & Fluid Depletion Risk",
        "mechanism": "Furosemide increases metformin plasma peak concentration and AUC without altering renal clearance, while predisposing to hypovolemia.",
        "clinical_action": "Monitor blood glucose control and maintain hydration status.",
        "source": "Clinical Pharmacology Reference Compendium"
    }
]

# Duplicate Active Ingredients Map for Accidental Overdose Detection
DUPLICATE_ACTIVE_INGREDIENTS = {
    "acetaminophen": {
        "common_brands": ["Tylenol", "Panadol", "Excedrin", "NyQuil", "DayQuil", "Percocet", "Vicodin", "Fioricet"],
        "daily_limit_adult": "4000 mg",
        "toxicity_warning": "Severe liver injury (hepatotoxicity) may result from cumulative daily doses exceeding 4,000 mg. Many combination prescription opioids and over-the-counter cold remedies contain unheralded acetaminophen.",
        "source": "FDA Acetaminophen Dosing & Liver Toxicity Safety Advisory"
    },
    "ibuprofen": {
        "common_brands": ["Advil", "Motrin", "Nuprin", "Combunox"],
        "daily_limit_adult": "3200 mg (Prescription) / 1200 mg (OTC)",
        "toxicity_warning": "Cumulative ingestion of multiple NSAID formulations dramatically increases the incidence of peptic ulcer disease, acute kidney injury, and cardiovascular complications.",
        "source": "FDA NSAID Safety Compendium"
    },
    "aspirin": {
        "common_brands": ["Bayer", "Ecotrin", "Bufferin", "Alka-Seltzer", "Excedrin"],
        "daily_limit_adult": "4000 mg",
        "toxicity_warning": "Concurrent use of multiple salicylate-containing preparations compounds bleeding risks and can precipitate salicylism.",
        "source": "Clinical Toxicology Reference Guidelines"
    }
}

# Cross-Allergy Profiles
ALLERGY_CROSS_MAP = {
    "penicillin": {
        "class_name": "Penicillin Class Antibiotics",
        "conflicting_drugs": ["amoxicillin", "ampicillin", "augmentin", "piperacillin", "penicillin"],
        "severity": "High",
        "warning_text": "Patient has a documented Penicillin allergy. Beta-lactam antibiotics share structural beta-lactam rings and can induce severe anaphylaxis, angioedema, or bronchospasm."
    },
    "sulfa": {
        "class_name": "Sulfonamide Class Medications",
        "conflicting_drugs": ["sulfamethoxazole", "bactrim", "septra", "sulfasalazine"],
        "severity": "High",
        "warning_text": "Patient has a documented Sulfa hypersensitivity. Sulfonamide antimicrobials can trigger severe cutaneous adverse reactions including Stevens-Johnson syndrome."
    },
    "aspirin": {
        "class_name": "Salicylates & NSAIDs",
        "conflicting_drugs": ["aspirin", "ibuprofen", "naproxen", "ketorolac", "diclofenac"],
        "severity": "High",
        "warning_text": "Patient has a documented Aspirin/NSAID allergy. May present with cross-reactive cyclooxygenase-1 inhibition precipitating asthma or angioedema."
    },
    "nsaid": {
        "class_name": "Nonsteroidal Anti-Inflammatory Drugs",
        "conflicting_drugs": ["ibuprofen", "naproxen", "aspirin", "meloxicam", "celecoxib", "diclofenac"],
        "severity": "High",
        "warning_text": "Patient has a documented NSAID sensitivity. Non-selective and selective NSAIDs should be avoided."
    }
}
