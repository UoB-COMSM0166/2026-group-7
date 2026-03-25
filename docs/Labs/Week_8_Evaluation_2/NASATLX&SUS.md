# HCI Evaluation - Quanlitative Evaluation
## 1. Study Design and Methodology

The evaluation utilized a **within-subjects design**. To account for potential **learning effects**, where participants gain skills from one part of the evaluation to use in another, the order was counterbalanced:
- **Group A (IDs 11–16):** Evaluated **easy mode** first, then **hard mode**.
- **Group B (IDs 21–26):** Evaluated **hard mode** first, then **easy mode**.

---

## 2. NASA Task Load Index

Following the "Raw TLX" method, the scores for the six dimensions were averaged.

|**Difficulty Level**|**Mental Demand**|**Temporal Demand**|**Effort**|**Frustration**|**Performance***|**Total Raw TLX**|
|---|---|---|---|---|---|---|
|**Easy Mode**|22.5|25.8|24.2|16.7|18.3|**21.5**|
|**Hard Mode**|74.2|70.8|75.8|58.3|48.3|**66.1**|

The Performance scale goes from 'Perfect' (0) to 'Failure' (100).

### Statistical Significance

To determine if the workload difference is significant, we apply the **Wilcoxon Signed Rank Test**.

| Parameter | Value | Source / Reasoning |
| :--- | :--- | :--- |
| **Number of Users ($n$)** | 12 | Total participants (6 starting with easy mode, 6 starting with hard mode). |
| **Significance Level ($\alpha$)** | 0.05 | The standard alpha value used to be 95% certain the difference is real. |
| **Critical Value** | 13 | The value found where the 0.05 alpha column and $n=12$ row intersect. |
| **$W$ Test Statistic** | 0 | Every user reported higher workload for hard mode; the sum of ranks for the lesser sign is 0. |
| **Result** | **Significant** | The $W$ statistic (0) is less than or equal to the critical value (13). |

**Conclusion:** Because the calculated $W$ test statistic is less than the critical value, there is a **statistically significant difference** in the perceived workload between **easy mode** and **hard mode**.

---

## 3. System Usability Scale (SUS) Analysis

| Metric | Value | Reference / Benchmarking |
| :--- | :--- | :--- |
| **Total Participants** | 12 | 6 starting with easy mode, 6 starting with hard mode. |
| **Calculation Method** | Normalized Sum × 2.5 | Based on Brooke's (1986) scoring algorithm. |
| **Mean SUS Score** | **76.5** | Average across all 12 participants. |
| **Industry Benchmark** | 68.0 | The research-based "average" usability score. |
| **Adjective Rating** | **Good / High** | A score of 76.5 is well above the industry average. |

### SUS Item Score Breakdown
To calculate the overall score, individual item contributions (0–4) were derived as follows:
* **Odd Items (1, 3, 5, 7, 9)**: Scale position minus 1.
* **Even Items (2, 4, 6, 8, 10)**: 5 minus the scale position.

**Conclusion:** The game is perceived as highly usable and easy to learn. Users specifically noted high confidence (Item 9) and low perceived inconsistency (Item 6) across both difficulty modes.

---

## 4. Key Findings and Feedback Analysis

- **Workload Drivers:** The primary contributors to workload in **hard mode** were **Effort** (75.8) and **Mental Demand** (74.2).
- **Learning Effects:** Users who played **easy mode** first (IDs 11–16) generally reported slightly lower frustration levels in **hard mode** compared to those who started with **hard mode**, indicating that the initial session helped them understand the game mechanics.    
- **Usability Consistency:** Item 5 of the SUS ("functions were well integrated") scored consistently high (Avg: 4.2/5), suggesting that even when the game is hard, the mechanics feel cohesive.
---
