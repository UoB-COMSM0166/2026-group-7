# HCI Evaluation - Part two
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

*Note: The Performance scale goes from 'Perfect' (0) to 'Failure' (100).

### Statistical Significance

To determine if the workload difference is significant, we apply the **Wilcoxon Signed Rank Test**, which is ideal for analyzing data from Likert scales in a within-subjects design.

- **Data Points:** We have data from 12 users ($n=12$).
- **Alpha Level:** Set at **0.05**, meaning we are 95% certain the difference is real.
- **Critical Value:** For $n=12$ and alpha **0.05**, the critical value is **13**.
- **Result:** Since every user reported a higher workload for **hard mode**, the calculated $W$ statistic is **0**. Because $0 \leq 13$, the difference in workload between **easy mode** and **hard mode** is **statistically significant**.

---

## 3. System Usability Scale (SUS) Analysis

The SUS provides a reliable tool for measuring the overall usability of the system.

- **Average SUS Score: 76.5**
- **Industry Benchmark:** Research shows that a SUS score above **68** is considered above average.
- **Interpretation:** With a score of **76.5**, **Park Street Survivor** is considered highly usable.

---

## 4. Qualitative Insights

- **Workload Drivers:** The primary contributors to workload in **hard mode** were **Effort** (75.8) and **Mental Demand** (74.2).
- **Learning Effects:** Users who played **easy mode** first (IDs 11–16) generally reported slightly lower frustration levels in **hard mode** compared to those who started with **hard mode**, indicating that the initial session helped them understand the game mechanics.    
- **Usability Consistency:** SUS scores remained stable across both groups, suggesting that the game's interface and integration (SUS Item 5) are perceived as high quality regardless of the difficulty level.

---

