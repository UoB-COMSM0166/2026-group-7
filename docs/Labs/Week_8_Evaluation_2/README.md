<div align="center">

# Week 8 Lab: HCI Evaluation — NASA-TLX & System Usability Scale

<br>

## Summary

</div>

> The primary objective of Week 8 was to conduct a **quantitative HCI evaluation** of *Park Street Survivor* using two industry-standard instruments: the **NASA Task Load Index (NASA-TLX)** to measure perceived workload, and the **System Usability Scale (SUS)** to benchmark usability. The study used a within-subjects design with counterbalancing to isolate the effect of difficulty on player experience.

<br>

<div align="center">

---

## 1. Study Design & Questionnaire

</div>

The evaluation used a **within-subjects design** with **14 participants** to measure perceived workload and usability across Easy Mode and Hard Mode. To mitigate **learning effects** — where skills gained from one condition carry over to another — participants were split into two counterbalanced groups:

- **Group A (IDs 11–17):** Evaluated **Easy Mode** first, then **Hard Mode**
- **Group B (IDs 21–27):** Evaluated **Hard Mode** first, then **Easy Mode**

The questionnaire covered all **six NASA-TLX dimensions** (**Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, and Frustration**) together with the **10-item SUS scale**. The live form is available below:

<br>

<p align="center">
  <a href="https://docs.google.com/forms/d/e/1FAIpQLScE2h6yzhfyCPNxqHIWHfnu0qHhnMf5HbUyW0H7V6NWE381wA/viewform?usp=header" target="_blank">
    <img src="https://img.shields.io/badge/View%20Evaluation%20Form-Google%20Forms-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="View Evaluation Form on Google Forms" />
  </a>
</p>

<br>

<table align="center">
<tr>
  <td align="center" width="50%" valign="top">
    <img src="Questions.png" width="100%" alt="Evaluation questionnaire questions" />
  </td>
  <td align="center" width="50%" valign="top">
    <img src="Responses.png" width="100%" alt="Evaluation questionnaire responses overview" />
  </td>
</tr>
<tr>
  <td align="center"><i>Questionnaire — NASA-TLX and SUS items as presented to participants</i></td>
  <td align="center"><i>Response overview — aggregated submissions from all 14 participants</i></td>
</tr>
</table>

<br>

<div align="center">

---

## 2. NASA Task Load Index

</div>

NASA-TLX responses were collected on a **10-point scale** and then **linearly transformed to a 0–100 scale** (value × 10) for consistency with standard NASA-TLX reporting conventions. Scores for all six dimensions were averaged across participants for each difficulty mode. The **Performance** dimension was measured as "How successful were you in achieving the goals?" — a higher score means the participant felt more successful. Unlike the other five dimensions (where higher = more demanding), a higher Performance score reflects lower workload burden, so Easy (79.3) > Hard (50.7) correctly indicates that players felt more successful on Easy Mode.

<br>

<div align="center">

| **Difficulty Level** | **Mental Demand** | **Physical Demand** | **Temporal Demand** | **Effort** | **Frustration** | **Performance*** | **Total TLX** |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Easy Mode** | 35.0 | 28.6 | 35.7 | 40.7 | 29.3 | 79.3 | **41.4** |
| **Hard Mode** | 68.6 | 48.6 | 71.4 | 66.4 | 53.6 | 50.7 | **59.9** |

</div>

<br>

The most pronounced increases were observed in **Temporal Demand** (35.7 → 71.4) and **Mental Demand** (35.0 → 68.6), indicating that Hard Mode substantially increases both time pressure and cognitive processing requirements. **Effort** also rises considerably (40.7 → 66.4), suggesting that players must invest more sustained attention and control in the harder condition.

**Physical Demand** also increases (28.6 → 48.6), but remains lower than the cognitive and temporal dimensions, indicating that the challenge is driven more by perception, reaction, and decision-making than by motor strain alone.

The **Performance** score drops from **79.3** (Easy) to **50.7** (Hard), reflecting that players felt less successful in Hard Mode — an expected result of higher difficulty. Since this dimension measures perceived success (higher = felt more successful), the drop confirms that Hard Mode's increased stakes reduced players' sense of achievement, while overall workload still rises markedly.

<br>

### Statistical Significance — Wilcoxon Signed-Rank Test

To determine whether the workload difference between modes is statistically significant, we compared each participant’s overall TLX score for Easy Mode and Hard Mode using a **Wilcoxon signed-rank test**. This non-parametric test was chosen over a paired t-test because the total TLX score is a composite of ordinal Likert-scale ratings and the sample size (*n* = 14) is insufficient to reliably assume a normal distribution.

<div align="center">

| Parameter | Value | Source / Reasoning |
|:---|:---:|:---|
| **Number of participants (*n*)** | 14 | 7 starting with Easy Mode, 7 starting with Hard Mode |
| **Significance level (α)** | 0.05 | Standard alpha — 95% confidence threshold |
| **Critical value** | 21 | Taken from the Wilcoxon table at α = 0.05, *n* = 14 |
| **W test statistic** | 0 | All participants reported a higher overall TLX score in Hard Mode |
| **Result** | **Significant** | W (0) ≤ critical value (21) |

</div>

**Conclusion:** The W statistic of 0 is less than or equal to the critical value of 21, so the difference in perceived workload between Easy Mode and Hard Mode is **statistically significant** at the 95% confidence level.

<br>

<div align="center">

---

## 3. System Usability Scale (SUS)

</div>

SUS scores were calculated using the standard Brooke (1986) method: for **odd-numbered items**, the contribution is **scale position − 1**; for **even-numbered items**, the contribution is **5 − scale position**. The summed contribution is then multiplied by **2.5**, giving a final score on a **0–100 scale**.

<div align="center">

| Metric | Value | Reference / Benchmarking |
|:---|:---:|:---|
| **Total participants** | 14 | 7 per counterbalanced group |
| **Calculation method** | Normalised Sum × 2.5 | Brooke's (1986) scoring algorithm |
| **Mean SUS score (Easy Mode)** | **79.8** | Average across 14 Easy Mode responses |
| **Mean SUS score (Hard Mode)** | **66.4** | Average across 14 Hard Mode responses |
| **Overall mean SUS score** | **73.1** | Mean across both difficulty conditions |
| **Industry benchmark** | 68.0 | Research-established "average" usability score |
| **Adjective rating** | **Good** | Overall usability is above the industry benchmark |

</div>

<br>

**Conclusion:** The system maintains a generally strong level of usability across both difficulty levels. **Easy Mode** scores highly at **79.8**, indicating a clear and accessible onboarding experience. **Hard Mode** falls to **66.4**, which is slightly below the common benchmark of 68, suggesting that usability becomes less robust once difficulty and pacing increase.

Participants still reported relatively strong confidence and integration of functions, but the decline from Easy to Hard Mode suggests that the harder level imposes additional interaction overhead beyond pure gameplay challenge.

<br>

<div align="center">

---

## 4. Key Findings & Action Plan

</div>

**Workload Drivers**

The primary contributors to Hard Mode workload were **Temporal Demand** (71.4), **Mental Demand** (68.6), and **Effort** (66.4), driven by increased obstacle density and reduced reaction time windows.

**Learning Effects**

The counterbalanced design helps reduce order effects and suggests that prior exposure to Easy Mode supports smoother adaptation to Hard Mode, reinforcing the value of progressive onboarding.

**Usability Consistency**

While overall SUS remains acceptable across both conditions, the drop from **79.8** in Easy Mode to **66.4** in Hard Mode shows that usability is somewhat less stable under higher pressure. This suggests that some interface or interaction demands become more noticeable once gameplay intensity increases.

**Action Plan**

Based on these findings, the team refined two areas:

1. **Fine-tune obstacle pacing** to better balance challenge and reaction time in Hard Mode.
2. **Strengthen early-stage onboarding and contextual guidance** so that players build sufficient mental models before encountering high-intensity gameplay.

These refinements were implemented in the subsequent sprint.

<br>

<div align="center">

---

## 5. Raw Data

</div>

**L1 NASA TLX**

| Dimension       | V1   | V2   | V3   | V4   | V5   | V6   | V7   | V8   | V9   | V10  | V11  | V12  | V13  | V14  |
| --------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Mental Demand   | 2    | 4    | 2    | 3    | 2    | 8    | 7    | 6    | 3    | 4    | 2    | 2    | 2    | 2    |
| Physical Demand | 2    | 1    | 1    | 3    | 1    | 4    | 6    | 6    | 2    | 5    | 3    | 2    | 2    | 2    |
| Temporal Demand | 2    | 5    | 2    | 4    | 2    | 5    | 7    | 6    | 1    | 6    | 3    | 2    | 2    | 3    |
| Performance     | 8    | 8    | 9    | 10   | 8    | 8    | 8    | 7    | 8    | 8    | 7    | 7    | 10   | 5    |
| Effort          | 2    | 5    | 4    | 4    | 3    | 7    | 6    | 6    | 3    | 6    | 3    | 3    | 2    | 3    |
| Frustration     | 3    | 1    | 6    | 2    | 2    | 6    | 3    | 6    | 1    | 3    | 1    | 3    | 1    | 3    |

**L2 NASA TLX**

| Dimension       | V1   | V2   | V3   | V4   | V5   | V6   | V7   | V8   | V9   | V10  | V11  | V12  | V13  | V14  |
| --------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Mental Demand   | 6    | 6    | 5    | 8    | 5    | 9    | 9    | 8    | 7    | 8    | 8    | 3    | 8    | 6    |
| Physical Demand | 8    | 1    | 4    | 3    | 1    | 7    | 3    | 7    | 8    | 7    | 8    | 3    | 5    | 3    |
| Temporal Demand | 7    | 7    | 6    | 7    | 6    | 7    | 9    | 8    | 10   | 9    | 6    | 6    | 6    | 6    |
| Performance     | 8    | 7    | 3    | 7    | 5    | 3    | 4    | 8    | 2    | 6    | 3    | 6    | 5    | 4    |
| Effort          | 5    | 6    | 6    | 7    | 4    | 8    | 8    | 7    | 8    | 8    | 8    | 4    | 7    | 7    |
| Frustration     | 4    | 6    | 6    | 3    | 4    | 6    | 9    | 5    | 9    | 6    | 2    | 6    | 5    | 4    |

**L1 SUS**

| Questions                                                | V1   | V2   | V3   | V4   | V5   | V6   | V7   | V8   | V9   | V10  | V11  | V12  | V13  | V14  |
| -------------------------------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1. I would like to use this game frequently.             | 2    | 4    | 3    | 2    | 2    | 4    | 4    | 5    | 5    | 3    | 5    | 4    | 2    | 3    |
| 2. I found Level 1 to be unnecessarily complex.          | 4    | 1    | 2    | 3    | 1    | 2    | 3    | 1    | 1    | 1    | 1    | 2    | 1    | 1    |
| 3. I thought Level 1 was easy to use.                    | 5    | 4    | 5    | 4    | 5    | 4    | 4    | 4    | 5    | 4    | 4    | 5    | 5    | 4    |
| 4. I would need technical support to play Level 1.       | 2    | 3    | 2    | 1    | 5    | 2    | 2    | 2    | 2    | 2    | 2    | 1    | 1    | 1    |
| 5. The various functions in Level 1 were well integrated.| 3    | 5    | 3    | 5    | 4    | 4    | 5    | 5    | 5    | 4    | 4    | 4    | 3    | 4    |
| 6. There was too much inconsistency in Level 1.          | 2    | 1    | 2    | 1    | 1    | 2    | 2    | 2    | 1    | 1    | 2    | 2    | 4    | 1    |
| 7. Most people would learn to use Level 1 very quickly.  | 4    | 4    | 4    | 4    | 5    | 4    | 4    | 4    | 5    | 4    | 5    | 5    | 5    | 4    |
| 8. I found Level 1 to be very awkward to use.            | 1    | 1    | 1    | 1    | 1    | 2    | 4    | 2    | 1    | 1    | 1    | 2    | 2    | 1    |
| 9. I felt very confident using Level 1.                  | 5    | 5    | 4    | 5    | 5    | 4    | 4    | 4    | 5    | 5    | 5    | 4    | 5    | 5    |
| 10. Requires learning many things before Level 1.        | 1    | 1    | 1    | 2    | 4    | 3    | 4    | 3    | 2    | 2    | 2    | 2    | 1    | 2    |

**L2 SUS**

| Questions                                                | V1   | V2   | V3   | V4   | V5   | V6   | V7   | V8   | V9   | V10  | V11  | V12  | V13  | V14  |
| -------------------------------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1. I would like to use this game frequently.             | 4    | 5    | 3    | 4    | 2    | 4    | 4    | 5    | 5    | 4    | 4    | 4    | 3    | 4    |
| 2. I found Level 2 to be unnecessarily complex.          | 2    | 2    | 1    | 2    | 1    | 3    | 4    | 3    | 2    | 2    | 1    | 2    | 2    | 2    |
| 3. I thought Level 2 was easy to use.                    | 2    | 5    | 3    | 3    | 3    | 4    | 2    | 4    | 1    | 3    | 4    | 4    | 3    | 3    |
| 4. I would need technical support to play Level 2.       | 2    | 4    | 4    | 1    | 1    | 2    | 4    | 3    | 4    | 2    | 2    | 2    | 1    | 2    |
| 5. The various functions in Level 2 were well integrated.| 4    | 5    | 4    | 4    | 4    | 4    | 5    | 5    | 5    | 4    | 4    | 4    | 4    | 4    |
| 6. There was too much inconsistency in Level 2.          | 2    | 1    | 3    | 1    | 1    | 2    | 4    | 3    | 1    | 2    | 2    | 2    | 3    | 2    |
| 7. Most people would learn to use Level 2 very quickly.  | 4    | 5    | 2    | 2    | 4    | 4    | 2    | 3    | 4    | 2    | 2    | 2    | 2    | 4    |
| 8. I found Level 2 to be very awkward to use.            | 1    | 1    | 1    | 2    | 2    | 1    | 2    | 2    | 1    | 2    | 2    | 4    | 3    | 2    |
| 9. I felt very confident using Level 2.                  | 4    | 5    | 3    | 4    | 3    | 3    | 2    | 4    | 2    | 3    | 2    | 3    | 3    | 4    |
| 10. Requires learning many things before Level 2.        | 1    | 1    | 2    | 1    | 2    | 1    | 3    | 4    | 5    | 4    | 2    | 3    | 4    | 3    |

---

<div align="center">

[Back to Project Home](../../../README.md)

</div>