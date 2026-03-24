<div align="center">

# Week 8 Lab: HCI Evaluation — NASA-TLX & System Usability Scale

<br>

## Summary

</div>

> The primary objective of Week 8 was to conduct a **quantitative HCI evaluation** of Park Street Survivor using two industry-standard instruments: the **NASA Task Load Index (NASA-TLX)** to measure perceived workload, and the **System Usability Scale (SUS)** to benchmark usability. The study used a within-subjects design with counterbalancing to isolate the true effect of difficulty on player experience.

<br>

<div align="center">

---

## 1. Study Design & Questionnaire

</div>

The evaluation used a **within-subjects design** with 12 participants to measure perceived workload and usability across Easy Mode and Hard Mode. To mitigate **learning effects** — where skills gained from one condition carry over to another — participants were split into two counterbalanced groups:

- **Group A (IDs 11–16):** Evaluated **Easy Mode** first, then **Hard Mode**
- **Group B (IDs 21–26):** Evaluated **Hard Mode** first, then **Easy Mode**

The questionnaire covered both NASA-TLX dimensions (Mental Demand, Temporal Demand, Effort, Frustration, Performance) and the 10-item SUS scale. The live form is available below:

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
  <td align="center"><i>Response overview — aggregated submissions from all 12 participants</i></td>
</tr>
</table>

<br>

<div align="center">

---

## 2. NASA Task Load Index

</div>

Following the **Raw TLX** method, the scores for all six dimensions were averaged across participants per difficulty mode. The Performance scale runs from *Perfect* (0) to *Failure* (100).

<br>

<div align="center">

| **Difficulty Level** | **Mental Demand** | **Temporal Demand** | **Effort** | **Frustration** | **Performance*** | **Total Raw TLX** |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Easy Mode** | 22.5 | 25.8 | 24.2 | 16.7 | 18.3 | **21.5** |
| **Hard Mode** | 74.2 | 70.8 | 75.8 | 58.3 | 48.3 | **66.1** |

</div>

<br>

The most dramatic shift occurred in **Effort** (24.2 → 75.8) and **Mental Demand** (22.5 → 74.2), confirming that Hard Mode significantly increases cognitive load. The comparatively lower **Frustration** jump (16.7 → 58.3) suggests the difficulty increase, while steep, is perceived as challenging rather than unfair.

<br>

### Statistical Significance — Wilcoxon Signed-Rank Test

To determine whether the workload difference between modes is statistically significant:

<div align="center">

| Parameter | Value | Source / Reasoning |
|:---|:---:|:---|
| **Number of participants (*n*)** | 12 | 6 starting with Easy Mode, 6 starting with Hard Mode |
| **Significance level (α)** | 0.05 | Standard alpha — 95% confidence threshold |
| **Critical value** | 13 | Taken from the Wilcoxon table at α = 0.05, *n* = 12 |
| **W test statistic** | 0 | Every participant reported higher workload for Hard Mode; the sum of ranks for the lesser sign is 0 |
| **Result** | **Significant** | W (0) ≤ critical value (13) |

</div>

**Conclusion:** The W statistic of 0 is less than or equal to the critical value of 13 — the difference in perceived workload between Easy Mode and Hard Mode is **statistically significant** at the 95% confidence level.

<br>

<div align="center">

---

## 3. System Usability Scale (SUS)

</div>

<div align="center">

| Metric | Value | Reference / Benchmarking |
|:---|:---:|:---|
| **Total participants** | 12 | 6 per counterbalanced group |
| **Calculation method** | Normalised Sum × 2.5 | Brooke's (1986) scoring algorithm |
| **Mean SUS score** | **76.5** | Average across all 12 participants |
| **Industry benchmark** | 68.0 | Research-established "average" usability score |
| **Adjective rating** | **Good / High** | 76.5 is well above the industry average |

</div>

<br>

Individual item contributions (0–4) were derived as follows:
- **Odd items (1, 3, 5, 7, 9):** Scale position − 1
- **Even items (2, 4, 6, 8, 10):** 5 − Scale position

**Conclusion:** The game is perceived as highly usable and easy to learn. Item 9 ("confidence in using the system") and Item 6 ("inconsistency") scored particularly well, indicating that players felt in control even as difficulty escalated.

<br>

<div align="center">

---

## 4. Key Findings & Action Plan

</div>

**Workload Drivers**

The primary contributors to Hard Mode workload were **Effort** (75.8) and **Mental Demand** (74.2), driven by the increased obstacle density and shorter reaction windows.

**Learning Effects**

Group A participants (Easy Mode first) reported slightly lower Frustration in Hard Mode than Group B, confirming that the initial session helps players internalise core mechanics before facing high-intensity gameplay. This validated our decision to implement a structured tutorial before any difficulty mode.

**Usability Consistency**

SUS Item 5 ("functions were well integrated") averaged 4.2 / 5 across both modes, suggesting that even under high workload the mechanics feel cohesive — the difficulty reads as intentional challenge rather than design inconsistency.

**Action Plan**

Based on these findings, the team committed to two targeted improvements:

1. **Reduce obstacle density in Hard Mode** to bring Temporal Demand into a more manageable range, reducing the workload gap without eliminating the difficulty contrast.
2. **Implement a mandatory contextual tutorial** to ensure all players — regardless of starting difficulty — are guided through core mechanics and hazard identification before high-intensity gameplay begins.

Both actions were executed in the subsequent sprint (Week 9).

<br>

---

<div align="center">

[Back to Project Home](../../../README.md)

</div>
