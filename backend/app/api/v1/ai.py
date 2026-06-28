from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sa_func, desc
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid

from app.core.database import get_db
from app.core.security import decode_token
from app.config import settings
from app.models.ai import AIConversation, AIMessage, AIMemory
from app.models.transaction import Account, Transaction, Category
from app.schemas.ai import ChatRequest, ChatResponse

router = APIRouter(prefix="/ai", tags=["AI Chat"])


async def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="לא מחובר")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="טוקן לא תקין")
    return payload["sub"]


async def _build_financial_context(user_id: str, db: AsyncSession) -> str:
    """Build financial context string from user's data for the AI."""
    context_parts = []

    # Get accounts
    result = await db.execute(
        select(Account).where(Account.user_id == user_id, Account.is_active == True)
    )
    accounts = result.scalars().all()

    if accounts:
        total_balance = sum(float(a.current_balance or 0) for a in accounts)
        context_parts.append(f"סה\"כ יתרות: ₪{total_balance:,.0f}")
        for a in accounts:
            context_parts.append(f"  - {a.name} ({a.institution or 'לא צוין'}): ₪{float(a.current_balance or 0):,.0f}")

    # Get recent transactions (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).date()
    result = await db.execute(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.date >= thirty_days_ago,
        ).order_by(desc(Transaction.date)).limit(50)
    )
    transactions = result.scalars().all()

    if transactions:
        income = sum(float(t.amount) for t in transactions if t.type == "income")
        expenses = sum(float(t.amount) for t in transactions if t.type == "expense")
        context_parts.append(f"\nחודש אחרון:")
        context_parts.append(f"  הכנסות: ₪{income:,.0f}")
        context_parts.append(f"  הוצאות: ₪{expenses:,.0f}")
        context_parts.append(f"  חיסכון: ₪{income - expenses:,.0f}")

        # Top categories
        category_spending = {}
        for t in transactions:
            if t.type == "expense":
                cat = t.description or "אחר"
                category_spending[cat] = category_spending.get(cat, 0) + float(t.amount)

        if category_spending:
            top_cats = sorted(category_spending.items(), key=lambda x: x[1], reverse=True)[:5]
            context_parts.append("\n  הוצאות מובילות:")
            for cat, amount in top_cats:
                context_parts.append(f"    - {cat}: ₪{amount:,.0f}")

    # Get AI memories for user
    result = await db.execute(
        select(AIMemory).where(AIMemory.user_id == user_id).order_by(desc(AIMemory.importance))
    )
    memories = result.scalars().all()
    if memories:
        context_parts.append("\nמידע שנשמר על המשתמש:")
        for m in memories:
            context_parts.append(f"  - [{m.category}] {m.key}: {m.value}")

    return "\n".join(context_parts)


def _build_system_prompt(financial_context: str) -> str:
    return f"""אתה מאזן (Ma'azan) - יועץ פיננסי אישי מבוסס AI למשקי בית ישראליים.

תפקידך:
- לנתח את המצב הפיננסי של המשתמש ולתת תובנות מעשיות
- לענות על שאלות בנוגע להוצאות, הכנסות, חיסכון ותקציב
- להציע דרכים לשיפור המצב הכלכלי
- להסביר מושגים פיננסיים ישראליים (פנסיה, קרן השתלמות, ביטוח לאומי, מס הכנסה וכו')
- לזהות דפוסי הוצאות ולהתריע על בעיות

כללים:
- ענה בעברית תמיד, אלא אם התבקשת אחרת
- השתמש בסימן ₪ לסכומים
- תן תשובות קצרות וברורות
- אם אין לך מידע מספיק, בקש מהמשתמש להוסיף נתונים
- הצע הצעות רלוונטיות בסוף כל תשובה

נתונים פיננסיים של המשתמש:
{financial_context if financial_context else "אין עדיין נתונים פיננסיים. הצע למשתמש להוסיף חשבונות ותנועות."}
"""


async def _call_openai(messages: list, api_key: str) -> str:
    """Call OpenAI API. Falls back to local response if no API key."""
    if not api_key:
        return _generate_local_response(messages)

    try:
        import openai
        client = openai.AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except ImportError:
        return _generate_local_response(messages)
    except Exception as e:
        return f"שגיאה בתקשורת עם ה-AI: {str(e)}"


def _generate_local_response(messages: list) -> str:
    """Generate a basic local response when OpenAI is not available."""
    user_msg = messages[-1]["content"].lower() if messages else ""

    # Extract financial context from system message
    system_msg = messages[0]["content"] if messages else ""
    has_data = "סה\"כ יתרות" in system_msg

    if not has_data:
        return (
            "שלום! 👋 אני מאזן, היועץ הפיננסי האישי שלך.\n\n"
            "אני רואה שעדיין לא הוספת נתונים פיננסיים. כדי שאוכל לעזור לך:\n\n"
            "1. **הוסף חשבונות בנק** - בדף הדשבורד\n"
            "2. **ייבא תנועות** - מקובץ CSV של הבנק או כרטיס אשראי\n"
            "3. **הוסף תנועות ידנית** - הכנסות והוצאות\n\n"
            "ברגע שיהיו נתונים, אוכל לנתח את המצב שלך ולתת תובנות! 📊"
        )

    if any(w in user_msg for w in ["הוצאות", "כמה הוצאתי", "הוצאה"]):
        return (
            "📊 בהתבסס על הנתונים שלך, הנה סיכום ההוצאות:\n\n"
            f"{_extract_from_context(system_msg, 'הוצאות')}\n\n"
            "💡 **טיפים:**\n"
            "- כדאי לבדוק אם יש מנויים שאפשר לבטל\n"
            "- השווה מחירים על הוצאות קבועות\n\n"
            "רוצה שאפרט יותר על קטגוריה מסוימת?"
        )

    if any(w in user_msg for w in ["חיסכון", "לחסוך", "saving"]):
        return (
            "💰 בואו נדבר על חיסכון!\n\n"
            f"{_extract_from_context(system_msg, 'חיסכון')}\n\n"
            "**הצעות לחיסכון:**\n"
            "1. הגדר יעד חיסכון חודשי (מומלץ: 20% מההכנסה)\n"
            "2. בדוק קרנות השתלמות - הטבת מס משמעותית\n"
            "3. שקול הפקדה לפנסיה מעבר לחובה\n\n"
            "רוצה שנבנה תוכנית חיסכון?"
        )

    if any(w in user_msg for w in ["יתרה", "כמה יש לי", "מאזן", "balance"]):
        return (
            f"🏦 הנה סיכום היתרות שלך:\n\n"
            f"{_extract_from_context(system_msg, 'יתרות')}\n\n"
            "רוצה לראות פירוט של התנועות האחרונות?"
        )

    return (
        "אני כאן לעזור! 😊\n\n"
        "אני יכול לענות על שאלות כמו:\n"
        "- \"כמה הוצאתי החודש?\"\n"
        "- \"מה המצב הפיננסי שלי?\"\n"
        "- \"איך אני יכול לחסוך יותר?\"\n"
        "- \"מה היתרה שלי?\"\n"
        "- \"נתח את ההוצאות שלי\"\n\n"
        "על מה תרצה לדבר?"
    )


def _extract_from_context(system_msg: str, topic: str) -> str:
    """Extract relevant info from financial context."""
    lines = system_msg.split("\n")
    relevant = []
    capture = False
    for line in lines:
        if topic in line:
            capture = True
            relevant.append(line.strip())
        elif capture:
            if line.strip().startswith("-") or line.strip().startswith("  "):
                relevant.append(line.strip())
            elif line.strip() and not line.strip().startswith(" "):
                capture = False
    return "\n".join(relevant) if relevant else f"מידע על {topic} זמין בדשבורד"


@router.post("/chat")
async def chat(
    request: Request,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = await get_current_user_id(request)

        # Get or create conversation
        conversation_id = body.conversation_id
        conversation = None

        if conversation_id:
            result = await db.execute(
                select(AIConversation).where(
                    AIConversation.id == conversation_id,
                    AIConversation.user_id == user_id,
                )
            )
            conversation = result.scalar_one_or_none()
            if not conversation:
                raise HTTPException(status_code=404, detail="שיחה לא נמצאה")

        if not conversation:
            # Create title from first message
            title = body.message[:50] + ("..." if len(body.message) > 50 else "")
            conversation = AIConversation(
                user_id=user_id,
                title=title,
            )
            db.add(conversation)
            await db.flush()

        # Save user message
        user_message = AIMessage(
            conversation_id=conversation.id,
            role="user",
            content=body.message,
        )
        db.add(user_message)

        # Build context and messages for AI
        financial_context = await _build_financial_context(user_id, db)
        system_prompt = _build_system_prompt(financial_context)

        # Get conversation history (last 20 messages)
        result = await db.execute(
            select(AIMessage).where(
                AIMessage.conversation_id == conversation.id
            ).order_by(AIMessage.created_at).limit(20)
        )
        history = result.scalars().all()

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            if msg.role in ("user", "assistant"):
                messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": body.message})

        # Get AI response
        ai_response = await _call_openai(messages, settings.openai_api_key)

        # Save AI response
        ai_message = AIMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=ai_response,
            model_used="gpt-4o" if settings.openai_api_key else "local",
        )
        db.add(ai_message)

        # Update conversation timestamp
        conversation.last_message_at = datetime.now(timezone.utc)

        await db.commit()

        # Generate follow-up suggestions
        suggestions = _generate_suggestions(body.message, financial_context)

        return ChatResponse(
            conversation_id=str(conversation.id),
            response=ai_response,
            suggestions=suggestions,
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def _generate_suggestions(user_message: str, context: str) -> list:
    """Generate follow-up suggestions."""
    msg = user_message.lower()
    suggestions = []

    if any(w in msg for w in ["הוצאות", "הוצאה"]):
        suggestions = ["פרט לפי קטגוריות", "השווה לחודש קודם", "הצע דרכים לחסוך"]
    elif any(w in msg for w in ["חיסכון", "לחסוך"]):
        suggestions = ["בנה תוכנית חיסכון", "מה לגבי קרן השתלמות?", "כמה אני חוסך בממוצע?"]
    elif any(w in msg for w in ["יתרה", "מאזן", "balance"]):
        suggestions = ["הצג תנועות אחרונות", "נתח מגמות", "מתי אני מקבל משכורת?"]
    else:
        suggestions = ["נתח את ההוצאות שלי", "מה המצב הפיננסי שלי?", "איך אוכל לחסוך?"]

    return suggestions


@router.get("/conversations")
async def list_conversations(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.user_id == user_id,
            AIConversation.is_archived == False,
        ).order_by(desc(AIConversation.last_message_at))
    )
    conversations = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "title": c.title,
            "last_message_at": c.last_message_at.isoformat() if c.last_message_at else None,
            "is_archived": c.is_archived,
        }
        for c in conversations
    ]


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    request: Request,
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    user_id = await get_current_user_id(request)
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == user_id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="שיחה לא נמצאה")

    result = await db.execute(
        select(AIMessage).where(
            AIMessage.conversation_id == conversation.id
        ).order_by(AIMessage.created_at)
    )
    messages = result.scalars().all()

    return {
        "id": str(conversation.id),
        "title": conversation.title,
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }
