import { useState, type CSSProperties } from "react";
import { cx } from "./ui";

export type YoungZeusState = "waiting" | "wondering" | "eureka" | "typing" | "working";

export interface YoungZeusMascotProps {
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
  state?: YoungZeusState;
  onStateChange?: (state: YoungZeusState) => void;
  size?: number | string;
}

export function YoungZeusMascot({
  className,
  style,
  interactive = true,
  state: controlledState,
  onStateChange,
  size = 140,
}: YoungZeusMascotProps) {
  const [internalState, setInternalState] = useState<YoungZeusState>("waiting");
  const currentState = controlledState ?? internalState;

  const updateState = (next: YoungZeusState) => {
    if (!controlledState) {
      setInternalState(next);
    }
    onStateChange?.(next);
  };

  const handleMascotClick = () => {
    if (!interactive) return;
    if (currentState === "waiting") {
      updateState("wondering");
    } else if (currentState === "wondering") {
      updateState("eureka");
    } else if (currentState === "eureka") {
      updateState("typing");
    } else if (currentState === "typing") {
      updateState("working");
    } else {
      updateState("waiting");
    }
  };

  return (
    <div
      className={cx("young-zeus-wrapper", `state-${currentState}`, className)}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        ...style,
      }}
      onClick={handleMascotClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleMascotClick();
        }
      }}
      title={interactive ? "Young Zeus Chibi Assistant" : undefined}
    >
      <svg
        id="young-zeus-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className={cx(
          "young-zeus-svg",
          currentState === "eureka" && "state-eureka",
          currentState === "typing" && "state-typing",
          currentState === "working" && "state-working",
        )}
        aria-hidden="true"
      >
        <defs>
          <filter id="zeus-bolt-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SOFT CLOUD PEDESTAL (Waiting Base) */}
        <g id="cloud-pedestal" className="anim-cloud">
          <path
            className="zeus-thin cloud-path"
            strokeDasharray="6 6"
            d="M 160 435 C 135 435 125 410 145 395 C 145 375 175 365 195 380 C 220 360 270 360 295 380 C 320 365 350 380 348 400 C 368 415 355 435 330 435 Z"
          />
        </g>

        {/* 2. LOWER BODY & FEET (With Foot-Tap Rig) */}
        <g id="chibi-legs">
          {/* Left Resting Foot */}
          <path
            className="zeus-stroke"
            d="M 205 378 L 205 402 C 205 408 195 408 190 408 C 180 408 180 395 192 395 L 198 395 L 198 378"
          />

          {/* Right Tapping Foot */}
          <g id="tapping-foot-rig" className="anim-foot-tap">
            <path
              className="zeus-stroke"
              d="M 285 378 L 285 402 C 285 408 296 408 302 408 C 314 408 314 395 300 395 L 294 395 L 294 378"
            />
            {/* Tap ripple accent line */}
            <path
              id="tap-ripples"
              className="zeus-accent-stroke zeus-thin"
              strokeWidth="3"
              d="M 312 414 C 320 414 326 408 326 402"
            />
          </g>
        </g>

        {/* 3. YOUNG CHIBI TOGA */}
        <g id="chibi-toga">
          <path
            className="zeus-stroke"
            d="M 180 310 C 165 328 170 368 190 378 L 295 378 C 315 368 320 328 305 310"
          />
          <path className="zeus-thin" d="M 182 312 L 235 378" />
          <path className="zeus-thin" d="M 250 310 C 275 330 298 345 304 376" />
        </g>

        {/* 4. ARMS & HANDS - STANDARD VS WORKING LAPTOP */}
        {currentState === "working" ? (
          <g id="chibi-working-rig">
            {/* Zeus Mini Golden Thunderbolt Laptop */}
            <g id="zeus-laptop" className="anim-laptop">
              {/* Laptop Screen / Lid */}
              <polygon
                points="200,320 280,314 286,356 204,364"
                className="zeus-stroke"
                strokeWidth="4"
                fill="var(--ds-bg-surface, #1e1e24)"
              />
              {/* Screen Glow / Inner Display */}
              <polygon
                points="205,324 275,319 281,352 209,358"
                fill="var(--ds-brand-gold, #f59e0b)"
                opacity="0.25"
              />
              {/* Mini Lightning Logo on back of laptop */}
              <path
                d="M 242 332 L 237 341 L 243 341 L 238 350 L 248 339 L 243 339 Z"
                fill="var(--ds-brand-gold, #f59e0b)"
              />
              {/* Laptop Base / Keyboard deck */}
              <polygon
                points="192,364 290,356 304,380 196,386"
                className="zeus-stroke"
                strokeWidth="4"
                fill="var(--ds-bg-base, #121216)"
              />
            </g>

            {/* Left Typing Arm & Hand */}
            <g id="arm-left-typing" className="anim-typing-left">
              <path
                className="zeus-stroke"
                d="M 180 294 C 172 320 186 348 214 366"
              />
              <circle cx="216" cy="366" r="6" className="zeus-stroke" fill="var(--ds-bg-base, #121216)" />
            </g>

            {/* Right Typing Arm & Hand */}
            <g id="arm-right-typing" className="anim-typing-right">
              <path
                className="zeus-stroke"
                d="M 302 294 C 310 320 296 348 268 364"
              />
              <circle cx="266" cy="364" r="6" className="zeus-stroke" fill="var(--ds-bg-base, #121216)" />
            </g>
          </g>
        ) : (
          <>
            {/* 4. LEFT RESTING ARM */}
            <g id="arm-left">
              <path
                className="zeus-stroke"
                d="M 182 290 C 160 300 152 325 162 342 C 168 350 178 352 186 345 C 192 338 195 322 195 308"
              />
            </g>

            {/* 5. RIGHT CHIN-TAPPING / WONDERING HAND */}
            <g id="arm-right-wondering" className="anim-chin-tap">
              <path
                className="zeus-stroke"
                d="M 302 292 C 324 300 335 320 328 340 C 320 356 304 354 295 338 L 285 278"
              />
              <path
                className="zeus-stroke"
                d="M 285 278 C 290 270 298 274 296 282 C 295 288 288 290 282 284"
              />
            </g>
          </>
        )}

        {/* 6. HEAD & HAIR */}
        <g id="head-group" className="anim-head-wonder">
          {/* Fluffy Wavy Youthful Zeus Hair */}
          <path
            className="zeus-stroke"
            d="M 165 210 C 135 185 142 135 185 125 C 192 90 245 85 275 105 C 315 90 358 120 348 158 C 375 190 360 235 330 248 C 338 275 315 298 290 295 C 278 305 255 308 245 300 C 225 308 200 302 192 290 C 168 288 152 260 165 235"
          />

          {/* Forehead Brow Ridge */}
          <path className="zeus-stroke" d="M 188 165 C 220 148 268 148 296 164" />

          {/* Cute Chubby Cheek & Jaw */}
          <path
            className="zeus-stroke"
            d="M 178 200 C 172 235 182 278 220 286 C 242 290 265 288 285 278 C 308 265 316 230 312 198"
          />

          {/* Laurel Leaf Headband */}
          <g id="laurel-wreath">
            <path className="zeus-stroke" strokeWidth="4.5" d="M 280 162 C 304 146 328 128 344 114" />
            <path className="zeus-fill-primary zeus-stroke" strokeWidth="4" d="M 290 146 C 286 132 300 130 304 142 Z" />
            <path className="zeus-fill-primary zeus-stroke" strokeWidth="4" d="M 310 134 C 306 120 320 118 324 130 Z" />
            <path className="zeus-fill-primary zeus-stroke" strokeWidth="4" d="M 330 122 C 326 108 340 106 344 118 Z" />
          </g>

          {/* Chibi Ears */}
          <path className="zeus-stroke" d="M 172 215 C 158 215 158 234 172 238" />
          <circle cx="164" cy="226" r="2.2" className="zeus-fill-primary" />

          {/* Left Eyebrow */}
          <path
            id="brow-left"
            className={cx("zeus-stroke", currentState !== "working" && "anim-brow-left")}
            strokeWidth="6"
            d={
              currentState === "working"
                ? "M 194 184 C 206 179 218 179 228 184"
                : currentState === "typing"
                ? "M 194 174 C 204 167 220 170 228 178"
                : "M 194 180 C 204 172 220 174 228 182"
            }
          />
          {/* Right Eyebrow */}
          <path
            id="brow-right"
            className="zeus-stroke"
            strokeWidth="6"
            d={
              currentState === "working"
                ? "M 262 184 C 272 179 284 179 294 184"
                : currentState === "typing"
                ? "M 262 178 C 268 170 284 167 294 174"
                : "M 262 184 C 268 178 284 176 294 182"
            }
          />

          {/* Large Shiny Chibi Eyes */}
          <g id="eye-left-socket">
            <circle cx="212" cy="202" r="10.5" className="zeus-fill-primary" />
            <g className="anim-pupil">
              <circle cx="214" cy="202" r="4.2" className="zeus-fill-bg" />
              <circle cx="216" cy="200" r="1.5" className="zeus-fill-primary" />
            </g>
          </g>

          <g id="eye-right-socket">
            <circle cx="278" cy="202" r="10.5" className="zeus-fill-primary" />
            <g className="anim-pupil">
              <circle cx="276" cy="202" r="4.2" className="zeus-fill-bg" />
              <circle cx="278" cy="200" r="1.5" className="zeus-fill-primary" />
            </g>
          </g>

          {/* Chibi Nose */}
          <path className="zeus-stroke" strokeWidth="5" d="M 244 206 C 247 212 248 215 243 218" />

          {/* Mouth */}
          <path
            id="mouth-path"
            className="zeus-stroke"
            strokeWidth="5"
            d={
              currentState === "eureka"
                ? "M 226 230 C 238 248 252 248 264 230 Z"
                : currentState === "wondering"
                ? "M 240 236 C 246 232 250 232 254 236"
                : currentState === "working"
                ? "M 240 236 L 254 236"
                : currentState === "typing"
                ? "M 236 232 C 244 240 252 240 260 232"
                : "M 238 234 C 244 238 252 238 256 234"
            }
            fill={currentState === "eureka" ? "currentColor" : "none"}
          />

          {/* Rosy Cheek Accents */}
          <line className="zeus-accent-stroke zeus-thin" strokeWidth="2.5" x1="188" y1="218" x2="198" y2="218" />
          <line className="zeus-accent-stroke zeus-thin" strokeWidth="2.5" x1="288" y1="218" x2="298" y2="218" />

          {/* Crown */}
          <g id="chibi-crown" className="anim-crown">
            <path
              className="zeus-stroke"
              strokeWidth="5.5"
              d="M 232 64 L 242 86 L 260 68 L 272 92 L 292 78 L 282 104 L 226 96 Z"
            />
          </g>

          {/* Mini Thunderbolt */}
          <g id="mini-thunderbolt" className="anim-bolt">
            <path
              d="M 314 96 L 298 118 L 309 119 L 294 144 L 322 114 L 308 113 Z"
              className="zeus-bolt-path"
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter="url(#zeus-bolt-glow)"
            />
          </g>
        </g>

        {/* 7. FLOATING QUESTION MARKS */}
        {currentState !== "eureka" && currentState !== "typing" && currentState !== "working" ? (
          <g id="question-marks-group">
            <g className="qmark-1" transform="translate(140, 150)">
              <text x="0" y="0" className="zeus-qmark zeus-accent-fill" fontSize="28" fontWeight="bold">?</text>
            </g>
            <g className="qmark-2" transform="translate(350, 160)">
              <text x="0" y="0" className="zeus-qmark zeus-primary-fill" fontSize="24" fontWeight="bold">¿</text>
            </g>
            <g className="qmark-3" transform="translate(155, 105)">
              <text x="0" y="0" className="zeus-qmark zeus-muted-fill" fontSize="18" fontWeight="bold">?</text>
            </g>
          </g>
        ) : null}

        {/* 8. EUREKA SPARK POP */}
        {currentState === "eureka" ? (
          <g id="eureka-symbol" transform="translate(245, 45)">
            <circle cx="0" cy="0" r="14" className="zeus-bolt-path" filter="url(#zeus-bolt-glow)" />
            <path d="M -3 -8 L 3 -8 L 4 0 L -4 0 Z" className="zeus-fill-bg" />
            <circle cx="0" cy="5" r="2.5" className="zeus-fill-bg" />
            <line className="zeus-accent-stroke" strokeWidth="3" strokeLinecap="round" x1="0" y1="-22" x2="0" y2="-16" />
            <line className="zeus-accent-stroke" strokeWidth="3" strokeLinecap="round" x1="16" y1="-16" x2="11" y2="-11" />
            <line className="zeus-accent-stroke" strokeWidth="3" strokeLinecap="round" x1="22" y1="0" x2="16" y2="0" />
            <line className="zeus-accent-stroke" strokeWidth="3" strokeLinecap="round" x1="-16" y1="-16" x2="-11" y2="-11" />
            <line className="zeus-accent-stroke" strokeWidth="3" strokeLinecap="round" x1="-22" y1="0" x2="-16" y2="0" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
