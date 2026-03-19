import sys
import json
import requests

def call_graphql(url, query, variables=None, cookies=None):
    headers = {"Content-Type": "application/json"}
    payload = {"query": query, "variables": variables}
    try:
        response = requests.post(url, json=payload, headers=headers, cookies=cookies, timeout=20)
        return response.json()
    except Exception:
        return None

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input: return
        input_data = json.loads(raw_input)
        conn = input_data.get("server_connection", {})
        STASH_URL = f"{conn.get('Scheme')}://localhost:{conn.get('Port')}/graphql"
        session = conn.get("SessionCookie", {})
        cookies = {session.get("Name"): session.get("Value")}
    except Exception: return

    # 1. Get all performers
    find_query = "{ findPerformers(filter: { per_page: -1 }) { performers { id } } }"
    result = call_graphql(STASH_URL, find_query, cookies=cookies)
    performers = result.get("data", {}).get("findPerformers", {}).get("performers", [])

    # 2. The "Remove" Mutation
    # Instead of setting to null, we use the 'remove' list to delete the fields
    mutation = """
    mutation DeleteFields($id: ID!) {
      performerUpdate(input: {
        id: $id,
        custom_fields: {
          remove: ["hotornot_stats", "performer_record"]
        }
      }) { id }
    }
    """

    count = 0
    for p in performers:
        res = call_graphql(STASH_URL, mutation, {"id": p["id"]}, cookies=cookies)
        if res and "errors" not in res:
            count += 1
        else:
            err = res.get("errors", [{}])[0].get("message", "Unknown Error")
            sys.stderr.write(f"Failed to delete fields for {p['id']}: {err}\n")

    print(json.dumps({"output": f"Successfully deleted custom field keys for {count} performers."}))

if __name__ == "__main__":
    main()