import logging

logger = logging.getLogger(__name__)


class LeadScoringService:

    WEIGHTS = {
        'intent': {'enroll': 30, 'explore': 15, 'curious': 5},
        'course_clarity': {'specific': 20, 'vague': 10, 'empty': 0},
        'budget': {'confirmed': 20, 'range': 10, 'unknown': 0},
        'timeline': {'this_year': 15, 'next_year': 8, 'exploring': 2},
        'completeness': {'full': 15, 'partial': 8, 'minimal': 2}
    }

    def compute(self, lead_data: dict) -> dict:
        scores = {}

        intent = self._classify_intent(lead_data.get('intent_level', ''))
        scores['intent'] = self.WEIGHTS['intent'].get(intent, 0)

        course = lead_data.get('course_interest', '')
        course_level = self._classify_course_clarity(course)
        scores['course_clarity'] = self.WEIGHTS['course_clarity'].get(course_level, 0)

        budget = lead_data.get('budget_range', '')
        budget_level = self._classify_budget(budget)
        scores['budget'] = self.WEIGHTS['budget'].get(budget_level, 0)

        timeline = lead_data.get('timeline', '')
        timeline_level = self._classify_timeline(timeline)
        scores['timeline'] = self.WEIGHTS['timeline'].get(timeline_level, 0)

        completeness = self._classify_completeness(lead_data)
        scores['completeness'] = self.WEIGHTS['completeness'].get(completeness, 0)

        total_score = sum(scores.values())
        total_score = min(100, max(0, total_score))

        return {
            'score': total_score,
            'category': self.categorise(total_score),
            'dimension_scores': scores,
        }

    def categorise(self, score: int) -> str:
        if score >= 70:
            return 'hot'
        if score >= 40:
            return 'warm'
        return 'cold'

    def decay_score(self, lead, days_inactive: int) -> int:
        decay = days_inactive * 2
        new_score = max(0, lead.score - decay)
        return new_score

    def _classify_intent(self, intent_level: str) -> str:
        intent = (intent_level or '').lower()
        if any(w in intent for w in ('enroll', 'admission', 'join', 'apply', 'definitely')):
            return 'enroll'
        if any(w in intent for w in ('explore', 'interested', 'considering', 'looking')):
            return 'explore'
        return 'curious'

    def _classify_course_clarity(self, course: str) -> str:
        if not course or course.strip() == '':
            return 'empty'
        vague_terms = ('any', 'something', 'not sure', 'whatever', 'undecided')
        if any(term in course.lower() for term in vague_terms):
            return 'vague'
        return 'specific'

    def _classify_budget(self, budget: str) -> str:
        if not budget or budget.strip() == '':
            return 'unknown'
        if any(w in budget.lower() for w in ('unknown', 'not sure', "don't know")):
            return 'unknown'
        if any(c.isdigit() for c in budget):
            if '-' in budget or 'to' in budget.lower():
                return 'range'
            return 'confirmed'
        return 'range'

    def _classify_timeline(self, timeline: str) -> str:
        if not timeline:
            return 'exploring'
        tl = timeline.lower()
        if any(w in tl for w in ('this year', '2024', '2025', 'now', 'soon', 'immediately')):
            return 'this_year'
        if any(w in tl for w in ('next year', '2026', 'later')):
            return 'next_year'
        return 'exploring'

    def _classify_completeness(self, lead_data: dict) -> str:
        required_fields = ['full_name', 'course_interest', 'location', 'budget_range', 'timeline', 'intent_level']
        filled = sum(1 for f in required_fields if lead_data.get(f, '').strip())
        if filled >= 5:
            return 'full'
        if filled >= 3:
            return 'partial'
        return 'minimal'
