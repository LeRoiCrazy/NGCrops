---
name: ngcrops-market-analysis
description: "Use when analyzing NationsGlory cereal market snapshots, computing 7-day price position, stock trend, sales trend, snapshot deltas, or producing deterministic BUY/HOLD/SELL recommendations with reasons and confidence."
argument-hint: "Analyze market snapshots or a selected cereal market dataset"
user-invocable: true
---
# NGCrops Market Analysis

Use this skill to turn cereal market snapshot data into a deterministic recommendation.

## When to Use
- Analyze NationsGlory cereal market snapshots.
- Compare the latest snapshot against prior snapshots.
- Compute 7-day price position, stock trend, sales trend, and snapshot deltas.
- Produce a BUY/HOLD/SELL recommendation with confidence and reasons.

## Inputs
Expect a dataset with, at minimum:
- A current snapshot
- Up to 7 days of historical snapshots
- Price values
- Stock values
- Sales or demand values
- Timestamps or dates for each snapshot

If required fields are missing, say so explicitly instead of guessing.

## Procedure
1. Normalize the data into a timeline ordered by snapshot date.
2. Compute the 7-day price position:
   - Use `((current_price - 7d_low) / (7d_high - 7d_low))` when the range is non-zero.
   - If the 7-day range is zero, treat the position as neutral.
   - Interpret lower values as cheaper relative to the recent range.
3. Compute stock trend over 7 days:
   - Compare the first and last valid stock values.
   - Classify as `up`, `down`, or `flat` using the overall direction and direction consistency.
4. Compute sales trend over 7 days:
   - Compare the first and last valid sales values.
   - Classify as `up`, `down`, or `flat` using the overall direction and direction consistency.
5. Compute previous snapshot deltas:
   - Price delta = current price minus previous price.
   - Stock delta = current stock minus previous stock.
   - Sales delta = current sales minus previous sales.
   - Also report percentage deltas when the previous value is non-zero.
6. Make a deterministic recommendation:
   - BUY when price position is low and the recent movement suggests favorable entry conditions.
   - HOLD when the signals conflict or the market is near neutral.
   - SELL when price position is high or the recent movement suggests weakening value.
7. Assign confidence:
   - Base it on signal agreement, data completeness, and trend consistency.
   - Use a simple, repeatable scale such as `low`, `medium`, or `high`, or a numeric percent if requested.
8. Write reasons:
   - List the strongest signals first.
   - Include the main evidence for and against the recommendation.
   - Keep reasons short, specific, and tied to the computed metrics.

## Decision Heuristics
Use the same logic every time.

### BUY
Choose BUY when most of these are true:
- 7-day price position is in the lower third of the range.
- Stock trend is improving or stable.
- Sales trend is improving or stable.
- The latest snapshot is not a sharp reversal against the trend.

### HOLD
Choose HOLD when:
- Signals are mixed.
- Price position is mid-range.
- One trend supports buying while another supports selling.
- Data is incomplete but still usable.

### SELL
Choose SELL when most of these are true:
- 7-day price position is in the upper third of the range.
- Stock trend is weakening.
- Sales trend is weakening.
- The latest snapshot shows deterioration from the previous snapshot.

## Output Format
Return a compact report with these sections:
- `Recommendation`: BUY, HOLD, or SELL
- `Confidence`: low, medium, or high, or a percent
- `7-day price position`: the computed position and short interpretation
- `Stock trend`: up, down, or flat, with short evidence
- `Sales trend`: up, down, or flat, with short evidence
- `Previous snapshot deltas`: price, stock, and sales deltas
- `Reasons`: 2-4 concise bullets ordered by importance

## Quality Checks
Before finalizing, verify that:
- The recommendation is deterministic from the same inputs.
- The reasoning matches the computed values.
- No unsupported assumptions were added.
- Missing data is called out clearly.
- The output stays concise and numerically grounded.
