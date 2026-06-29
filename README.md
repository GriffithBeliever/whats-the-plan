# Haven — Auth Flow (Boilerplate)

This is the **Pass 1 skeleton**: Login → Sign Up → OTP → Plans, with **stubbed
authentication**. There's no backend yet — auth is faked so you can build and
test the navigation flow end to end.

---

## Running the app

```bash
# Start Metro (keep this terminal open)
npm start

# In a second terminal — build & launch on a connected device/emulator
npm run android      # or: npm run ios
```

If you just installed a native module, do a clean rebuild instead:

```bash
cd android && ./gradlew clean && cd ..
npm start -- --reset-cache
npm run android
```

---

## How to log in (stubbed credentials)

Auth is currently **faked** — the screens don't hit a real server. Here's exactly
what to do on each screen to get through the flow.

### Path A — Log In (fastest)

The Login screen accepts **anything**. It doesn't check credentials yet.

1. Open the app → you land on the **Login** screen
2. Type **any** username (e.g. `test`)
3. Type **any** password (e.g. `test`)
4. Tap **Log In**
5. ✅ You're taken straight to the **Plans** screen

> Why: `handleLogin` calls `signIn('fake-token-123')` without checking the
> inputs. Any input logs you in.

### Path B — Sign Up → OTP

This path goes through phone verification.

1. On the Login screen, tap **"No account? Sign up"**
2. Fill in **Name, Username, Phone, Password** (any values — not validated yet)
3. Tap **Sign Up** → you're taken to the **OTP** screen
4. Enter the code: **`1 2 3 4 5 6`**  ← this is the only accepted code
5. Tap **Verify**
6. ✅ Verified → you land on the **Plans** screen

> Any code **other than `123456`** shows "Incorrect code" and clears the boxes.

### Logging out

On the **Plans** screen, tap **Log out**. This clears the token and returns you
to the Login screen.

---

## What's actually happening (the auth mechanism)

The whole flow hinges on one piece of state: a **token** held in `AuthContext`.

```
No token   →  AuthStack  (Login / SignUp / OTP)
Has token  →  MainTabs   (Plans)
```

- `signIn(token)` saves a token → the app swaps to the Plans screen automatically
- `signOut()` clears the token → the app swaps back to Login automatically
- The token is persisted with **AsyncStorage**, so you stay logged in across
  app restarts (close & reopen — you'll still be on Plans)

You never manually navigate between the auth screens and the main app. Setting
or clearing the token does it, because `RootNavigator` re-renders when the token
changes.

### The stub lines (where to plug in a real backend later)

| File | Stub | Replace with |
|------|------|--------------|
| `LoginScreen.tsx` | `signIn('fake-token-123')` | real `POST /auth/login` → use returned token |
| `SignUpScreen.tsx` | `navigation.navigate('OTP', ...)` | real `POST /auth/signup` → trigger OTP send |
| `OTPScreen.tsx` | `if (code === '123456')` | real `POST /auth/verify-otp` → use returned token |

When you swap these for real API calls, **nothing else changes** — the navigation
reacts to the token exactly the same way.

---

## Quick reference

| Screen | Input to proceed |
|--------|------------------|
| **Login** | any username + any password |
| **Sign Up** | any values in all 4 fields |
| **OTP** | `123456` |
| **Plans** | "Log out" returns to Login |

---

## Project structure

```
src/
├── context/
│   └── AuthContext.tsx       # token state + signIn/signOut (the spine)
├── navigator/
│   ├── RootNavigator.tsx     # picks AuthStack vs MainTabs based on token
│   ├── AuthStack.tsx         # Login → SignUp → OTP
│   └── MainTabs.tsx          # bottom tabs (Plans for now)
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   └── OTPScreen.tsx
│   └── PlansScreen.tsx
└── components/
    ├── Button.tsx
    └── Input.tsx
```

> Note: navigation folder is `navigator/` in this project — keep imports
> consistent with that name. [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
