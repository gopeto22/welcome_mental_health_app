# Google Cloud Text-to-Speech Setup Guide

**Status:** 🔴 **BLOCKER** - Required before voice sample generation can proceed

**Impact:** Blocks B1 (voice samples) → Focus group testing → Survivor testing

**Priority:** HIGH (needed for Nov 10-12 focus group)

---

## Why This Is Needed

Our focus group with 10 Tamil-speaking survivors emphasized that **voice quality is critical** for:
- Building trust and familiarity
- Feeling safe enough to engage
- Cultural and linguistic appropriateness

We need to generate 60 voice samples (5 phrases × 2 voices × 3 rates × 2 pitches) for survivors to rate, so we can select optimal voice parameters before survivor testing.

**Current situation:** The script `scripts/generate_therapeutic_audio.py` is ready to run, but requires Google Cloud credentials to access the Text-to-Speech API.

---

## Setup Instructions

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the project's Google account

**Do you have an existing GCP project?**
- [ ] **Yes** → Note the project ID: `_______________`
- [ ] **No** → Create a new project:
  - Click "Select a project" → "New Project"
  - Project name: `tamil-mind-mate-tts`
  - Click "Create"

---

### Step 2: Enable Cloud Text-to-Speech API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Text-to-Speech API"
3. Click on "Cloud Text-to-Speech API"
4. Click **"Enable"**

**Verification:** You should see "API enabled" with a green checkmark.

---

### Step 3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **"Create Service Account"**
3. Fill in details:
   - **Service account name:** `tamil-mind-mate-tts-service`
   - **Service account ID:** `tamil-mind-mate-tts-service` (auto-filled)
   - **Description:** "Service account for Text-to-Speech API access"
4. Click **"Create and Continue"**

---

### Step 4: Grant TTS Permissions

1. In the "Grant this service account access to project" section:
   - **Role:** Select "Cloud Text-to-Speech API User"
   - Or search for: `roles/cloudtexttospeech.user`
2. Click **"Continue"**
3. Skip "Grant users access to this service account" (optional)
4. Click **"Done"**

---

### Step 5: Generate JSON Key File

1. In the **Service Accounts** list, find `tamil-mind-mate-tts-service`
2. Click the three dots (⋮) → **"Manage keys"**
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"** as the key type
5. Click **"Create"**

**Result:** A JSON file will download to your computer (e.g., `tamil-mind-mate-tts-service-abc123.json`)

**⚠️ IMPORTANT:** This file contains sensitive credentials. Keep it secure!

---

### Step 6: Store Credentials Securely

**Option A: Local Development (Recommended for Testing)**

1. Move the JSON file to a secure location:
   ```bash
   mkdir -p ~/.gcp
   mv ~/Downloads/tamil-mind-mate-tts-service-*.json ~/.gcp/tts-credentials.json
   chmod 600 ~/.gcp/tts-credentials.json
   ```

2. Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/tts-credentials.json"
   ```

3. Make it persistent (add to `~/.zshrc`):
   ```bash
   echo 'export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/tts-credentials.json"' >> ~/.zshrc
   source ~/.zshrc
   ```

**Option B: Production Deployment**

1. Store credentials as a secret in your deployment platform:
   - **Heroku:** `heroku config:set GOOGLE_APPLICATION_CREDENTIALS="$(cat ~/.gcp/tts-credentials.json)"`
   - **AWS/Azure:** Use secret management service (AWS Secrets Manager, Azure Key Vault)
   - **Docker:** Mount as volume or pass as environment variable

2. Update service configuration to use the secret

---

### Step 7: Verify Setup

Run this test command to verify credentials work:

```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main
python3 -c "
from google.cloud import texttospeech
client = texttospeech.TextToSpeechClient()
print('✅ Google Cloud TTS credentials are working!')
print('Available voices:', len(client.list_voices().voices))
"
```

**Expected output:**
```
✅ Google Cloud TTS credentials are working!
Available voices: 500+
```

**If you see an error:**
- `DefaultCredentialsError`: Environment variable not set correctly
- `PermissionDenied`: Service account doesn't have TTS permissions
- `ImportError`: Need to install google-cloud-texttospeech (see below)

---

### Step 8: Install Python Dependencies (If Needed)

If you get `ImportError: No module named 'google.cloud.texttospeech'`:

```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main/services/speech-service
source venv/bin/activate
pip install google-cloud-texttospeech
```

---

## Next Steps After Setup

Once Google Cloud credentials are configured, you can proceed with:

### 1. Generate Voice Samples (Immediate)

```bash
cd /Users/Joro/Downloads/tamil-mind-mate-main
python scripts/generate_therapeutic_audio.py
```

**Output:**
- 60 MP3 files in `assets/therapeutic_audio/`
- `assets/therapeutic_audio/index.json` (metadata)
- `assets/therapeutic_audio/rating_template.csv` (for focus group)

**Time:** ~10 minutes to generate all samples

---

### 2. Quality Assurance (30 minutes)

- [ ] Listen to 5-10 random samples to verify quality
- [ ] Get Tamil speaker to validate pronunciation and naturalness
- [ ] Check all files are playable (not corrupted)
- [ ] Verify metadata in index.json is correct

---

### 3. Create Focus Group Materials (2-3 days)

**Deliverables:**
- [ ] One-pager (Tamil + English): Study purpose, DPIA summary
- [ ] Likert rating cards: Calmness, clarity, naturalness, preference (1-5 scale)
- [ ] SUDS mini-trial protocol: Pre-rating → listen to samples → post-rating
- [ ] Consent form: Participation rights, data usage, withdrawal option

**Owner:** UX/Research team (coordinate with Francesca)

---

### 4. Conduct Focus Group (Nov 10-12)

**Participants:** 10-15 Tamil-speaking users

**Protocol:**
1. Consent form signature
2. Pre-session SUDS rating
3. Listen to 60 audio samples (randomized order)
4. Rate each on Likert scales
5. Post-session SUDS rating
6. Free-text feedback

**Data Collection:** `rating_responses.csv` with participant_id, sample_id, ratings

**Analysis:** Calculate mean + SD for each voice parameter

**Output:** Voice parameter recommendations (optimal voice/rate/pitch)

---

## Cost Considerations

**Google Cloud TTS Pricing:**
- **Standard voices:** $4 per 1 million characters
- **WaveNet voices:** $16 per 1 million characters

**Estimated costs for this project:**

### Phase 1: Voice Sample Generation (One-time)
- 60 samples × ~50 characters each = 3,000 characters
- Cost: **~$0.05** (negligible)

### Phase 2: Development Testing (Ongoing)
- Assume 100 test sessions × 200 characters average = 20,000 characters
- Cost: **~$0.32** (negligible)

### Phase 3: Focus Group + Survivor Testing
- 25 participants × 10 interactions × 200 characters = 50,000 characters
- Cost: **~$0.80** (negligible)

### Phase 4: Production (If scaled)
- 1,000 users × 100 interactions × 200 characters = 20,000,000 characters
- Cost: **~$320/month** (WaveNet) or **~$80/month** (Standard)

**Budget recommendation:** Start with $50/month budget, monitor usage via GCP console.

---

## Monitoring Usage

**Set up billing alerts:**
1. Go to **Billing** → **Budgets & alerts**
2. Create budget: `$50/month`
3. Set alert thresholds: 50%, 90%, 100%
4. Add email notification: [team email]

**Check usage:**
```bash
# View current month's TTS usage
gcloud logging read "resource.type=audited_resource AND protoPayload.serviceName=texttospeech.googleapis.com" --limit 100 --format json
```

---

## Troubleshooting

### Problem: "Application Default Credentials are not available"

**Solution:**
```bash
# Verify environment variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Should output: /Users/Joro/.gcp/tts-credentials.json

# If empty, set it:
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/tts-credentials.json"
```

---

### Problem: "Permission denied" when accessing TTS API

**Solution:**
1. Go to **IAM & Admin** → **Service Accounts**
2. Find your service account
3. Check it has role: "Cloud Text-to-Speech API User"
4. If not, click **"Grant Access"** and add the role

---

### Problem: "Quota exceeded" error

**Solution:**
1. Go to **APIs & Services** → **Quotas**
2. Search for "Text-to-Speech"
3. Check daily/monthly limits
4. Request quota increase if needed (usually not necessary for testing)

---

### Problem: JSON file not found or invalid

**Solution:**
```bash
# Check file exists and is readable
ls -l ~/.gcp/tts-credentials.json

# Verify JSON is valid
python3 -c "import json; json.load(open('~/.gcp/tts-credentials.json'))"

# If corrupted, regenerate key from GCP console
```

---

## Security Best Practices

**DO:**
- ✅ Store credentials in `~/.gcp/` (outside project directory)
- ✅ Set file permissions to `600` (owner read/write only)
- ✅ Add `*.json` to `.gitignore` (never commit credentials)
- ✅ Rotate keys every 90 days
- ✅ Use separate service accounts for dev/staging/production

**DON'T:**
- ❌ Commit credentials to Git
- ❌ Share JSON file via email or Slack
- ❌ Use same credentials across projects
- ❌ Give service account more permissions than needed

---

## For DevOps/Admin

**Checklist:**
- [ ] GCP project created or identified
- [ ] Cloud Text-to-Speech API enabled
- [ ] Service account created with TTS permissions
- [ ] JSON key generated and downloaded
- [ ] Credentials stored securely
- [ ] Environment variable set and tested
- [ ] Python dependencies installed
- [ ] Test command verified success
- [ ] Billing alerts configured
- [ ] Credentials documented in team password manager

**Time estimate:** 30-60 minutes for initial setup

**Owner:** [Assign to DevOps or technical team member]

**Deadline:** ASAP (blocking voice sample generation for Nov 10 focus group)

---

## Questions?

**Technical Issues:**
- Check [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- Contact: [Technical lead email]

**Access/Permissions:**
- Contact GCP project admin: [Admin email]

**Budget/Billing:**
- Contact project coordinator: [Coordinator email]

---

**Status Tracking:**

- [ ] Step 1: GCP project ready
- [ ] Step 2: TTS API enabled
- [ ] Step 3: Service account created
- [ ] Step 4: Permissions granted
- [ ] Step 5: JSON key downloaded
- [ ] Step 6: Credentials configured
- [ ] Step 7: Setup verified (test passed)
- [ ] Step 8: Dependencies installed

**Setup completed by:** _______________

**Date:** _______________

**Next action:** Run `python scripts/generate_therapeutic_audio.py`
